# Verification Checklist - Gemini Integration

## ✅ File Structure Verification

Use este checklist para verificar que todos los archivos están en su lugar:

### Core Implementation Files
- [ ] `api-gateway/src/gemini/gemini.service.ts` - EXISTS
- [ ] `api-gateway/src/gemini/gemini.controller.ts` - EXISTS
- [ ] `api-gateway/src/gemini/gemini.module.ts` - EXISTS
- [ ] `api-gateway/src/gemini/dto/ask-gemini.dto.ts` - EXISTS

### Configuration Files
- [ ] `api-gateway/.env.example` - EXISTS
- [ ] `api-gateway/.env.local` - EXISTS
- [ ] `api-gateway/.env` - **CREATE THIS (copy from .env.example)**

### Documentation Files
- [ ] `SETUP_GEMINI.md` - EXISTS
- [ ] `setup.sh` - EXISTS (Linux/MacOS)
- [ ] `setup.ps1` - EXISTS (Windows)
- [ ] `api-gateway/GEMINI_INTEGRATION.md` - EXISTS
- [ ] `api-gateway/GEMINI_TESTING.md` - EXISTS
- [ ] `api-gateway/GEMINI_RESUMEN.md` - EXISTS

### Modified Files
- [ ] `api-gateway/package.json` - CONTAINS `@google/generative-ai` and `axios`
- [ ] `api-gateway/src/app.module.ts` - IMPORTS `GeminiModule`

---

## 🔍 Code Verification

### 1. Check GeminiService Has All Methods
```bash
grep -n "getMCPTools\|processUserRequest\|executeMCPTool\|healthCheck\|initializeMCPTools" \
  api-gateway/src/gemini/gemini.service.ts
```

Expected: All 5 methods found

### 2. Check GeminiController Has All Endpoints
```bash
grep -n "@Post\|@Get" api-gateway/src/gemini/gemini.controller.ts
```

Expected: 
- @Post('ask')
- @Post('test')
- @Get('health')
- @Get('tools')

### 3. Check DTOs Are Properly Defined
```bash
grep -n "export class\|@" api-gateway/src/gemini/dto/ask-gemini.dto.ts
```

Expected: AskGeminiDto and GeminiAskResponse classes

### 4. Check AppModule Imports GeminiModule
```bash
grep -n "GeminiModule" api-gateway/src/app.module.ts
```

Expected: GeminiModule in imports array

---

## 🔧 Prerequisites Verification

### 1. Node.js Version
```bash
node -v
# Expected: v18.0.0 or higher
```

### 2. npm Packages Installed
```bash
cd api-gateway
npm list @google/generative-ai axios
# Expected: Both packages listed
```

### 3. Google Gemini API Key
```bash
cat .env | grep GEMINI_API_KEY
# Expected: GEMINI_API_KEY=your-actual-key-here (NOT "your-gemini-api-key-here")
```

---

## 🚀 Runtime Verification

### Step 1: Start MCP Server (Terminal 1)
```bash
cd 2parcial/semana13/mcp-server
npm run start
# Expected: "MCP Server listening on port 9000"
# Wait for: "Express is listening on port 9000"
```

### Step 2: Start API Gateway (Terminal 2)
```bash
cd 2parcial/semana13/api-gateway
npm run start
# Expected: "Nest application successfully started on port 3000"
```

### Step 3: Test Health Endpoint (Terminal 3)
```bash
curl -X GET http://localhost:3000/api/gemini/health
# Expected response:
# {
#   "success": true,
#   "gemini": true,
#   "mcpServer": true,
#   "timestamp": "2024-01-15T10:30:00Z"
# }
```

**CRITICAL**: Both `"gemini": true` and `"mcpServer": true` must be true

### Step 4: Test Ask Endpoint
```bash
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Hola?"}'

# Expected: Response from Gemini with success: true
```

### Step 5: Test Tools Endpoint
```bash
curl -X GET http://localhost:3000/api/gemini/tools
# Expected: Array of 3 tools: buscar_verificacion, es_pendiente, cambiar_a_verificado
```

---

## 📊 Verification Levels

### Level 1: Basic Setup ✅
- [ ] All files exist
- [ ] package.json has dependencies
- [ ] AppModule imports GeminiModule
- [ ] .env configured with GEMINI_API_KEY

### Level 2: Build & Compile ✅
- [ ] No TypeScript compilation errors
- [ ] npm install completes without errors
- [ ] No import/export errors

### Level 3: Runtime ✅
- [ ] MCP Server starts successfully
- [ ] API Gateway starts successfully
- [ ] Health endpoint returns gemini: true, mcpServer: true

### Level 4: Functional ✅
- [ ] GET /api/gemini/tools returns 3 tools
- [ ] POST /api/gemini/ask returns response
- [ ] Tools are used automatically by Gemini

### Level 5: Integration ✅
- [ ] Complex queries work
- [ ] Tool execution with results works
- [ ] Natural language responses generated

---

## 🧪 Test Scenarios

### Scenario 1: Simple Query
```bash
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Cuántas verificaciones hay?"}'

Expected: 
- success: true
- response: Contains information about verifications
- toolsUsed: Includes "buscar_verificacion"
```

### Scenario 2: Status Check
```bash
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Está pendiente la verificación 1?"}'

Expected:
- success: true
- toolsUsed: Includes "es_pendiente"
```

### Scenario 3: Update Operation
```bash
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "Marca la verificación 1 como verificada"}'

Expected:
- success: true
- toolsUsed: Includes "cambiar_a_verificado"
```

---

## 🚨 Common Issues & Fixes

### Issue: "GEMINI_API_KEY no encontrada"
**Status**: ❌ CRITICAL
**Fix**: 
1. Check if .env file exists: `ls -la api-gateway/.env`
2. Check if GEMINI_API_KEY is set: `cat api-gateway/.env | grep GEMINI_API_KEY`
3. Verify it's not a placeholder value
4. Restart API Gateway

### Issue: "Cannot find module '@google/generative-ai'"
**Status**: ❌ CRITICAL
**Fix**:
1. Run `cd api-gateway && npm install`
2. Verify in package.json: `grep @google/generative-ai package.json`
3. Check node_modules exists: `ls -la node_modules/@google/generative-ai`

### Issue: "No se pudo conectar con MCP Server"
**Status**: ❌ CRITICAL
**Fix**:
1. Verify MCP Server is running: `curl http://localhost:9000/health`
2. Check port 9000 is free: `lsof -i :9000` (Mac/Linux) or `netstat -ano | findstr :9000` (Windows)
3. Check MCP_SERVER_URL in .env: `cat api-gateway/.env | grep MCP_SERVER_URL`
4. Verify MCP Server logs for errors

### Issue: "Health check returns gemini: false"
**Status**: ❌ CRITICAL
**Fix**:
1. Verify GEMINI_API_KEY is correct
2. Test with curl: `curl https://generativelanguage.googleapis.com/...`
3. Check Google AI Studio for valid key
4. Try restarting API Gateway

### Issue: "Type error: X is not a function"
**Status**: ⚠️ WARNING
**Fix**:
1. Check GeminiService has all required methods
2. Verify DTOs are exported correctly
3. Rebuild TypeScript: `npm run build`

---

## 📋 Sign-Off Verification

Before considering the integration complete, verify:

- [ ] **All Files Created**: Every file in "File Structure Verification" ✓
- [ ] **Code Quality**: No TypeScript errors, proper imports
- [ ] **Dependencies**: All npm packages installed
- [ ] **Configuration**: .env properly configured with valid GEMINI_API_KEY
- [ ] **Health Status**: Both Gemini and MCP Server health checks pass
- [ ] **API Functionality**: All 4 endpoints return 200 status
- [ ] **Tool Integration**: Tools are used automatically by Gemini
- [ ] **Documentation**: All 6 documentation files present and complete
- [ ] **Examples**: Can run examples from GEMINI_TESTING.md successfully
- [ ] **Troubleshooting**: Can resolve issues using GEMINI_INTEGRATION.md

---

## 📞 Final Checks

### Check 1: File Integrity
```bash
# Count created files
find . -path "*api-gateway/src/gemini*" -type f | wc -l
# Expected: 4 files

# Check package.json modifications
grep -c "@google/generative-ai" api-gateway/package.json
# Expected: 1
```

### Check 2: Module Structure
```bash
# Verify module structure
ls -la api-gateway/src/gemini/
# Expected: controller, service, module, dto (folder)
```

### Check 3: Documentation
```bash
# Count documentation files
ls -la api-gateway/GEMINI*.md | wc -l
# Expected: 3 files
```

### Check 4: Configuration Files
```bash
# Check env files
ls -la api-gateway/.env*
# Expected: .env (or error if not created), .env.example, .env.local
```

---

**When all checks pass with ✅, the Gemini integration is complete and ready to use!**

For detailed setup instructions, see: `SETUP_GEMINI.md`
For API reference, see: `api-gateway/GEMINI_INTEGRATION.md`
For test examples, see: `api-gateway/GEMINI_TESTING.md`
