"""
Scan management and execution API endpoints.
"""

import asyncio
import subprocess
import json
from datetime import datetime
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from ..core.database import get_db_session
from ..core.nats_client import NATSClient
from ..core.redis_client import RedisClient
from ..models.scan import Scan, ScanType, ScanStatus, ScanResult, Vulnerability, SeverityLevel
from ..models.user import User
from .auth import get_current_user


router = APIRouter(prefix="/api/scans", tags=["Scans"])


# Pydantic models
class ScanCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    scan_type: ScanType
    targets: List[str] = Field(..., min_items=1)
    ports: Optional[List[str]] = None
    config: Optional[Dict[str, Any]] = None
    project_id: Optional[str] = None


class ScanResponse(BaseModel):
    id: str
    name: str
    scan_type: str
    status: str
    targets: List[str]
    ports: Optional[List[str]]
    config: Optional[Dict[str, Any]]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    total_hosts: int
    total_services: int
    vulnerabilities_found: int
    created_at: datetime
    user_id: str
    project_id: Optional[str]


class ScanResultResponse(BaseModel):
    id: str
    host: str
    port: Optional[int]
    protocol: Optional[str]
    service: Optional[str]
    version: Optional[str]
    banner: Optional[str]
    os_guess: Optional[str]
    raw_data: Optional[Dict[str, Any]]


class VulnerabilityResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    severity: str
    cve_id: Optional[str]
    cwe_id: Optional[str]
    host: str
    port: Optional[int]
    path: Optional[str]
    parameter: Optional[str]
    evidence: Optional[str]
    solution: Optional[str]
    references: Optional[List[str]]
    confirmed: bool
    false_positive: bool


# Initialize clients
nats_client = NATSClient()
redis_client = RedisClient()


@router.post("/", response_model=ScanResponse)
async def create_scan(
    scan_data: ScanCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Create and start a new scan."""
    # Create scan record
    new_scan = Scan(
        name=scan_data.name,
        scan_type=scan_data.scan_type,
        targets=scan_data.targets,
        ports=scan_data.ports,
        config=scan_data.config,
        user_id=current_user.id,
        project_id=scan_data.project_id,
        status=ScanStatus.PENDING,
    )
    
    db.add(new_scan)
    await db.commit()
    await db.refresh(new_scan)
    
    # Start scan in background
    background_tasks.add_task(execute_scan, new_scan.id, db)
    
    return ScanResponse(
        id=str(new_scan.id),
        name=new_scan.name,
        scan_type=new_scan.scan_type.value,
        status=new_scan.status.value,
        targets=new_scan.targets,
        ports=new_scan.ports,
        config=new_scan.config,
        started_at=new_scan.started_at,
        completed_at=new_scan.completed_at,
        total_hosts=new_scan.total_hosts,
        total_services=new_scan.total_services,
        vulnerabilities_found=new_scan.vulnerabilities_found,
        created_at=new_scan.created_at,
        user_id=str(new_scan.user_id),
        project_id=str(new_scan.project_id) if new_scan.project_id else None,
    )


@router.get("/", response_model=list[ScanResponse])
async def list_scans(
    skip: int = 0,
    limit: int = 100,
    scan_type: Optional[ScanType] = None,
    status: Optional[ScanStatus] = None,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """List all scans for current user."""
    query = select(Scan).where(Scan.user_id == current_user.id)
    
    if scan_type:
        query = query.where(Scan.scan_type == scan_type)
    if status:
        query = query.where(Scan.status == status)
    
    query = query.offset(skip).limit(limit).order_by(Scan.created_at.desc())
    result = await db.execute(query)
    scans = result.scalars().all()
    
    return [
        ScanResponse(
            id=str(scan.id),
            name=scan.name,
            scan_type=scan.scan_type.value,
            status=scan.status.value,
            targets=scan.targets,
            ports=scan.ports,
            config=scan.config,
            started_at=scan.started_at,
            completed_at=scan.completed_at,
            total_hosts=scan.total_hosts,
            total_services=scan.total_services,
            vulnerabilities_found=scan.vulnerabilities_found,
            created_at=scan.created_at,
            user_id=str(scan.user_id),
            project_id=str(scan.project_id) if scan.project_id else None,
        )
        for scan in scans
    ]


@router.get("/{scan_id}", response_model=ScanResponse)
async def get_scan(
    scan_id: str,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get scan details."""
    result = await db.execute(
        select(Scan).where(
            and_(Scan.id == scan_id, Scan.user_id == current_user.id)
        )
    )
    scan = result.scalar_one_or_none()
    
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )
    
    return ScanResponse(
        id=str(scan.id),
        name=scan.name,
        scan_type=scan.scan_type.value,
        status=scan.status.value,
        targets=scan.targets,
        ports=scan.ports,
        config=scan.config,
        started_at=scan.started_at,
        completed_at=scan.completed_at,
        total_hosts=scan.total_hosts,
        total_services=scan.total_services,
        vulnerabilities_found=scan.vulnerabilities_found,
        created_at=scan.created_at,
        user_id=str(scan.user_id),
        project_id=str(scan.project_id) if scan.project_id else None,
    )


@router.get("/{scan_id}/results", response_model=list[ScanResultResponse])
async def get_scan_results(
    scan_id: str,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get scan results."""
    # Verify scan belongs to user
    result = await db.execute(
        select(Scan).where(
            and_(Scan.id == scan_id, Scan.user_id == current_user.id)
        )
    )
    scan = result.scalar_one_or_none()
    
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )
    
    result = await db.execute(
        select(ScanResult).where(ScanResult.scan_id == scan_id)
    )
    scan_results = result.scalars().all()
    
    return [
        ScanResultResponse(
            id=str(result.id),
            host=result.host,
            port=result.port,
            protocol=result.protocol,
            service=result.service,
            version=result.version,
            banner=result.banner,
            os_guess=result.os_guess,
            raw_data=result.raw_data,
        )
        for result in scan_results
    ]


@router.get("/{scan_id}/vulnerabilities", response_model=list[VulnerabilityResponse])
async def get_scan_vulnerabilities(
    scan_id: str,
    severity: Optional[SeverityLevel] = None,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get scan vulnerabilities."""
    # Verify scan belongs to user
    result = await db.execute(
        select(Scan).where(
            and_(Scan.id == scan_id, Scan.user_id == current_user.id)
        )
    )
    scan = result.scalar_one_or_none()
    
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )
    
    query = select(Vulnerability).where(Vulnerability.scan_id == scan_id)
    if severity:
        query = query.where(Vulnerability.severity == severity)
    
    result = await db.execute(query)
    vulnerabilities = result.scalars().all()
    
    return [
        VulnerabilityResponse(
            id=str(vuln.id),
            name=vuln.name,
            description=vuln.description,
            severity=vuln.severity.value,
            cve_id=vuln.cve_id,
            cwe_id=vuln.cwe_id,
            host=vuln.host,
            port=vuln.port,
            path=vuln.path,
            parameter=vuln.parameter,
            evidence=vuln.evidence,
            solution=vuln.solution,
            references=vuln.references,
            confirmed=vuln.confirmed,
            false_positive=vuln.false_positive,
        )
        for vuln in vulnerabilities
    ]


@router.delete("/{scan_id}")
async def delete_scan(
    scan_id: str,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Delete scan and all related data."""
    result = await db.execute(
        select(Scan).where(
            and_(Scan.id == scan_id, Scan.user_id == current_user.id)
        )
    )
    scan = result.scalar_one_or_none()
    
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )
    
    await db.delete(scan)
    await db.commit()
    
    return {"message": "Scan deleted successfully"}


@router.post("/{scan_id}/cancel")
async def cancel_scan(
    scan_id: str,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Cancel running scan."""
    result = await db.execute(
        select(Scan).where(
            and_(Scan.id == scan_id, Scan.user_id == current_user.id)
        )
    )
    scan = result.scalar_one_or_none()
    
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )
    
    if scan.status not in [ScanStatus.PENDING, ScanStatus.RUNNING]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Scan cannot be cancelled"
        )
    
    scan.status = ScanStatus.CANCELLED
    await db.commit()
    
    return {"message": "Scan cancelled successfully"}


# Background scan execution
async def execute_scan(scan_id: str, db: AsyncSession) -> None:
    """Execute scan with real pentest tools."""
    # Get scan record
    result = await db.execute(select(Scan).where(Scan.id == scan_id))
    scan = result.scalar_one_or_none()
    
    if not scan:
        return
    
    # Update scan status
    scan.status = ScanStatus.RUNNING
    scan.started_at = datetime.utcnow()
    await db.commit()
    
    try:
        # Execute scan based on type
        if scan.scan_type == ScanType.PORT:
            results = await execute_port_scan(scan)
        elif scan.scan_type == ScanType.VULNERABILITY:
            results = await execute_vulnerability_scan(scan)
        elif scan.scan_type == ScanType.WEB:
            results = await execute_web_scan(scan)
        elif scan.scan_type == ScanType.NETWORK:
            results = await execute_network_scan(scan)
        elif scan.scan_type == ScanType.SERVICE:
            results = await execute_service_scan(scan)
        elif scan.scan_type == ScanType.SSL:
            results = await execute_ssl_scan(scan)
        elif scan.scan_type == ScanType.DNS:
            results = await execute_dns_scan(scan)
        else:
            results = {"error": "Unsupported scan type"}
        
        # Process and store results
        await process_scan_results(scan, results, db)
        
        # Update scan status
        scan.status = ScanStatus.COMPLETED
        scan.completed_at = datetime.utcnow()
        
    except Exception as e:
        scan.status = ScanStatus.FAILED
        print(f"Scan {scan_id} failed: {e}")
    
    await db.commit()


async def execute_port_scan(scan: Scan) -> Dict[str, Any]:
    """Execute port scan using nmap."""
    results = {
        "hosts": [],
        "total_hosts": 0,
        "total_services": 0,
        "vulnerabilities": []
    }
    
    for target in scan.targets:
        try:
            # Build nmap command
            cmd = ["nmap", "-sS", "-sV", "-O", "--script", "default,safe"]
            
            if scan.ports:
                port_str = ",".join(scan.ports)
                cmd.extend(["-p", port_str])
            else:
                cmd.append("-p-")  # Scan all ports
            
            cmd.extend(["-oX", "-", target])  # XML output to stdout
            
            # Execute nmap
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                # Parse nmap XML output
                host_data = parse_nmap_xml(stdout.decode())
                results["hosts"].append(host_data)
                results["total_hosts"] += 1
                results["total_services"] += len(host_data.get("ports", []))
        
        except Exception as e:
            print(f"Error scanning {target}: {e}")
    
    return results


async def execute_vulnerability_scan(scan: Scan) -> Dict[str, Any]:
    """Execute vulnerability scan."""
    # First do port scan
    port_results = await execute_port_scan(scan)
    
    # Then check for vulnerabilities
    vulnerabilities = []
    
    for host in port_results["hosts"]:
        for port in host.get("ports", []):
            # Check for common vulnerabilities based on service
            vulns = check_service_vulnerabilities(port)
            vulnerabilities.extend(vulns)
    
    return {
        **port_results,
        "vulnerabilities": vulnerabilities
    }


async def execute_web_scan(scan: Scan) -> Dict[str, Any]:
    """Execute web application scan."""
    results = {
        "hosts": [],
        "vulnerabilities": []
    }
    
    for target in scan.targets:
        # Check if target is web service
        if not (target.startswith("http://") or target.startswith("https://")):
            target = f"http://{target}"
        
        # Use tools like nikto, dirb, gobuster
        try:
            # Run nikto
            cmd = ["nikto", "-h", target, "-Format", "json"]
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                # Parse nikto results
                web_vulns = parse_nikto_results(stdout.decode())
                results["vulnerabilities"].extend(web_vulns)
        
        except Exception as e:
            print(f"Error scanning {target}: {e}")
    
    return results


async def execute_network_scan(scan: Scan) -> Dict[str, Any]:
    """Execute network scan."""
    results = {
        "hosts": [],
        "topology": {},
        "routes": []
    }
    
    for target in scan.targets:
        try:
            # Use traceroute
            cmd = ["traceroute", "-n", target]
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                hops = parse_traceroute(stdout.decode())
                results["routes"].extend(hops)
        
        except Exception as e:
            print(f"Error network scanning {target}: {e}")
    
    return results


async def execute_service_scan(scan: Scan) -> Dict[str, Any]:
    """Execute service enumeration scan."""
    return await execute_port_scan(scan)


async def execute_ssl_scan(scan: Scan) -> Dict[str, Any]:
    """Execute SSL/TLS scan."""
    results = {
        "certificates": [],
        "vulnerabilities": []
    }
    
    for target in scan.targets:
        try:
            # Use testssl.sh or openssl
            cmd = ["openssl", "s_client", "-connect", f"{target}:443", "-showcerts"]
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                stdin=asyncio.subprocess.DEVNULL
            )
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                cert_info = parse_ssl_cert(stdout.decode())
                results["certificates"].append(cert_info)
        
        except Exception as e:
            print(f"Error SSL scanning {target}: {e}")
    
    return results


async def execute_dns_scan(scan: Scan) -> Dict[str, Any]:
    """Execute DNS enumeration scan."""
    results = {
        "records": [],
        "subdomains": []
    }
    
    for target in scan.targets:
        try:
            # Use dig for DNS enumeration
            cmd = ["dig", "ANY", target]
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                dns_records = parse_dig_output(stdout.decode())
                results["records"].extend(dns_records)
        
        except Exception as e:
            print(f"Error DNS scanning {target}: {e}")
    
    return results


# Result parsing functions
def parse_nmap_xml(xml_data: str) -> Dict[str, Any]:
    """Parse nmap XML output."""
    # Simplified parsing - in production use proper XML parser
    import xml.etree.ElementTree as ET
    
    try:
        root = ET.fromstring(xml_data)
        host_data = {
            "address": "",
            "hostname": "",
            "ports": [],
            "os": ""
        }
        
        for host in root.findall("host"):
            address = host.find("address")
            if address is not None:
                host_data["address"] = address.get("addr", "")
            
            for port in host.findall("ports/port"):
                port_data = {
                    "port": int(port.get("portid", 0)),
                    "protocol": port.get("protocol", ""),
                    "state": "",
                    "service": "",
                    "version": ""
                }
                
                state = port.find("state")
                if state is not None:
                    port_data["state"] = state.get("state", "")
                
                service = port.find("service")
                if service is not None:
                    port_data["service"] = service.get("name", "")
                    port_data["version"] = service.get("version", "")
                
                if port_data["state"] == "open":
                    host_data["ports"].append(port_data)
        
        return host_data
    
    except Exception as e:
        print(f"Error parsing nmap XML: {e}")
        return {"error": "Failed to parse nmap output"}


def check_service_vulnerabilities(port: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Check for common vulnerabilities based on service."""
    vulnerabilities = []
    
    service = port.get("service", "").lower()
    version = port.get("version", "").lower()
    
    # Common service vulnerability checks
    if service == "ssh":
        vulnerabilities.append({
            "name": "SSH Service Detected",
            "severity": SeverityLevel.INFO,
            "description": f"SSH service running on port {port['port']}",
        })
    
    elif service == "http":
        vulnerabilities.append({
            "name": "HTTP Service Detected",
            "severity": SeverityLevel.INFO,
            "description": f"HTTP service running on port {port['port']}",
        })
    
    elif service == "ftp":
        vulnerabilities.append({
            "name": "FTP Service Detected",
            "severity": SeverityLevel.MEDIUM,
            "description": f"FTP service running on port {port['port']} - check for anonymous access",
        })
    
    return vulnerabilities


def parse_nikto_results(json_data: str) -> List[Dict[str, Any]]:
    """Parse nikto scan results."""
    try:
        data = json.loads(json_data)
        vulnerabilities = []
        
        for vulnerability in data.get("vulnerabilities", []):
            vuln = {
                "name": vulnerability.get("msg", "Unknown vulnerability"),
                "severity": SeverityLevel.MEDIUM,
                "description": vulnerability.get("msg", ""),
                "host": vulnerability.get("host", ""),
                "port": vulnerability.get("port", 80),
            }
            vulnerabilities.append(vuln)
        
        return vulnerabilities
    
    except Exception as e:
        print(f"Error parsing nikto results: {e}")
        return []


def parse_traceroute(output: str) -> List[Dict[str, Any]]:
    """Parse traceroute output."""
    hops = []
    for line in output.split("\n"):
        if line.strip() and not line.startswith("traceroute"):
            parts = line.split()
            if len(parts) >= 2 and parts[0].isdigit():
                hop = {
                    "hop": int(parts[0]),
                    "ip": parts[1] if not parts[1].startswith("*") else None,
                    "rtt": parts[2] if len(parts) > 2 else None
                }
                hops.append(hop)
    return hops


def parse_ssl_cert(output: str) -> Dict[str, Any]:
    """Parse SSL certificate information."""
    cert_info = {
        "subject": "",
        "issuer": "",
        "valid_from": "",
        "valid_to": "",
        "fingerprint": ""
    }
    
    lines = output.split("\n")
    for line in lines:
        if "subject=" in line:
            cert_info["subject"] = line.split("subject=", 1)[1].strip()
        elif "issuer=" in line:
            cert_info["issuer"] = line.split("issuer=", 1)[1].strip()
        elif "notBefore=" in line:
            cert_info["valid_from"] = line.split("notBefore=", 1)[1].strip()
        elif "notAfter=" in line:
            cert_info["valid_to"] = line.split("notAfter=", 1)[1].strip()
    
    return cert_info


def parse_dig_output(output: str) -> List[Dict[str, Any]]:
    """Parse dig DNS output."""
    records = []
    
    for line in output.split("\n"):
        parts = line.split()
        if len(parts) >= 4 and not line.startswith(";"):
            record = {
                "name": parts[0] if len(parts) > 0 else "",
                "ttl": parts[1] if len(parts) > 1 else "",
                "class": parts[2] if len(parts) > 2 else "",
                "type": parts[3] if len(parts) > 3 else "",
                "data": " ".join(parts[4:]) if len(parts) > 4 else ""
            }
            records.append(record)
    
    return records


async def process_scan_results(scan: Scan, results: Dict[str, Any], db: AsyncSession) -> None:
    """Process and store scan results."""
    # Store scan results
    for host in results.get("hosts", []):
        scan_result = ScanResult(
            scan_id=scan.id,
            host=host.get("address", "unknown"),
            port=host.get("ports", [{}])[0].get("port") if host.get("ports") else None,
            protocol=host.get("ports", [{}])[0].get("protocol") if host.get("ports") else None,
            service=host.get("ports", [{}])[0].get("service") if host.get("ports") else None,
            version=host.get("ports", [{}])[0].get("version") if host.get("ports") else None,
            banner=None,  # Extract from service detection
            os_guess=host.get("os"),
            raw_data=host,
        )
        db.add(scan_result)
    
    # Store vulnerabilities
    for vuln in results.get("vulnerabilities", []):
        vulnerability = Vulnerability(
            scan_id=scan.id,
            name=vuln.get("name", "Unknown"),
            description=vuln.get("description"),
            severity=vuln.get("severity", SeverityLevel.INFO),
            host=vuln.get("host", "unknown"),
            port=vuln.get("port"),
            evidence=vuln.get("evidence"),
            solution=vuln.get("solution"),
            references=vuln.get("references"),
        )
        db.add(vulnerability)
    
    # Update scan statistics
    scan.total_hosts = results.get("total_hosts", 0)
    scan.total_services = results.get("total_services", 0)
    scan.vulnerabilities_found = len(results.get("vulnerabilities", []))
    
    await db.commit()