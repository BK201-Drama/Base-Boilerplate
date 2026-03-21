# BDD Scenarios Template

## Feature: <feature name>

### Scenario 1: Happy path
- Given <initial state>
- When <user action>
- Then <expected result>

### Scenario 2: Validation failure
- Given <invalid input>
- When <submit action>
- Then <error message + status code>

### Scenario 3: Permission denied
- Given <user role without permission>
- When <attempt protected action>
- Then <403 or equivalent>

### Scenario 4: Edge case (optional)
- Given <boundary condition>
- When <action>
- Then <safe expected behavior>
