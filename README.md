# IPv4 & CIDR Toolkit

A lightweight networking utility for calculating IPv4 subnet information and exploring CIDR notation. Built as a hands-on project to strengthen my understanding of IP addressing, subnetting, and core networking concepts relevant to network security.

## Overview

IP addressing and subnetting are fundamental to network design, routing, and firewall policy configuration. The **IPv4 & CIDR Toolkit** aims to simplify common subnet calculations by turning an IPv4 address and its CIDR prefix into useful network information.

The project combines practical network engineering concepts with software development, providing a simple way to calculate and verify subnet details.

## Objectives

- Strengthen my understanding of IPv4 addressing and CIDR notation.
- Practise subnet mask calculations and network boundary identification.
- Understand the relationship between network bits and host bits.
- Explore edge cases in subnet calculations.
- Build a practical utility relevant to network security and troubleshooting.

## Planned Features

- IPv4 address and CIDR prefix validation.
- Subnet mask and wildcard mask calculation.
- Network address and broadcast address calculation.
- Address range and usable host count.
- Subnet membership checks.
- Handling of edge cases, including `/0`, `/31`, and `/32`.


## Networking Concepts Covered

| Concept | Description |
|---|---|
| IPv4 addressing | Structure and representation of IPv4 addresses |
| CIDR notation | Representing network prefixes using prefix lengths |
| Subnet masks | Identifying network and host portions of an address |
| Network address | Identifying the address representing a subnet |
| Broadcast address | Identifying the IPv4 broadcast address for a subnet |
| Host ranges | Determining address ranges and usable host counts |
| Subnet membership | Checking whether an IP belongs to a specified subnet |


## Testing Strategy

The toolkit will be tested against:

- Valid IPv4 addresses and prefix lengths.
- Invalid addresses and out-of-range prefixes.
- Different subnet sizes.
- Boundary cases such as `/0`, `/31`, and `/32`.
- Subnet membership and address-range calculations.

Results will be compared against independent reference calculations to verify correctness.

## Scope and Limitations

This project is intended as an educational networking utility. It focuses on IPv4 subnet calculations and does not replace routing-table analysis, IP address management systems, or production network configuration tools.

## Project Status

**In development.**

Features, implementation details, and test coverage will be updated as the project progresses.

## Author

Developed as part of a personal Network Security Tools Lab to deepen practical understanding of TCP/IP networking, IPv4 addressing, and subnetting.
