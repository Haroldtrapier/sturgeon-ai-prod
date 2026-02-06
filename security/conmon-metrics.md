# Continuous Monitoring (ConMon) Metrics

- Failed logins
- Privilege escalations
- Export events (proposals/compliance)
- Data access by role
- Cross-team (denied) access attempts
- All signals logged in immutable audit_logs table

## Recommended ConMon Review Cycle
- Review monthly with security officer
- Flag anomalies for IR (see IR playbook)
- Maintain conmon metrics as part of your ATO evidence pack

## Evidence Location
- Table: audit_logs
- Associated users/roles/actions for each event

## Table Schema
| Timestamp | User | Event | Entity | Details |
|-----------|------|-------|--------|---------|
| ...       | ...  | ...   | ...    | ...     |

