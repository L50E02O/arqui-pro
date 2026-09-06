import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { useEffect } from 'react'
import apolloClient from './services/graphql/apolloClient'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { notificationService } from './services/websocket/notificationService'
import ErrorBoundary from './components/common/ErrorBoundary'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Home from './pages/Home'
import FindArchitects from './pages/FindArchitects'
import AboutUs from './pages/AboutUs'
import LoginPage from './pages/auth/LoginPage'
import RegistroClientePage from './pages/auth/RegistroClientePage'
import RegistroArquitectoPage from './pages/auth/RegistroArquitectoPage'
import RegistroModeradorPage from './pages/auth/RegistroModeradorPage'

import ClientChat from './pages/Cliente/ClientChat'
import ArchitectDashboard from './pages/Arquitecto/ArchitectDashboard'
import ArchitectChat from './pages/Arquitecto/ArchitectChat'
import CreateProject from './pages/Arquitecto/CreateProject'
import ArchitectProjectDetail from './pages/Arquitecto/ArchitectProjectDetail'
import ArquitectoProfile from './pages/Arquitecto/ArquitectoProfile'
import MisProyectosArquitecto from './pages/Arquitecto/MisProyectos'
import { ModeratorDashboard, Verificaciones, Incidencias, Reportes } from './pages/Moderator'
import { ReporteViewer } from './pages/Moderator/ReporteViewer'
import ClienteLayout from './components/layout/Cliente/ClienteLayout'
import ArquitectoLayout from './components/layout/Arquitecto/ArquitectoLayout'
import MainLayout from './components/layout/MainLayout'
import ClienteHome from './pages/Cliente/ClienteHomePage'
import MisProyectos from './pages/Cliente/MisProyectos'
import ProyectoDetail from './pages/Arquitecto/ProyectoDetail'
import AIChatPage from './pages/AIChatPage'
import './App.css'

// Componente interno para manejar WebSocket y notificaciones
function WebSocketManager() {
  const { user } = useAuth()

  useEffect(() => {
    // Solicitar permiso para notificaciones cuando la app carga
    notificationService.requestPermission()
  }, [])

  useEffect(() => {
    // Conectar al WebSocket de notificaciones para todos los usuarios autenticados
    if (user && user.id) {
      notificationService.connect()
      console.log('✅ WebSocket de notificaciones conectado para usuario:', user.id)

      // Cleanup al desmontar
      return () => {
        notificationService.disconnect()
      }
    }
  }, [user])

  return null
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ApolloProvider client={apolloClient}>
          <Router>
            <WebSocketManager />
            <Routes>
              {/* Rutas Públicas */}
              <Route path="/" element={<MainLayout children={<Home/>} />} />
              <Route path="/architects" element={<MainLayout children={<FindArchitects />}/>} />
              <Route path="/about" element={<MainLayout children={<AboutUs />}/>} />
              <Route path="/architect/:id" element={<MainLayout children={<ArquitectoProfile />}/>} />
              <Route path="/arquitecto/:id" element={<MainLayout children={<ArquitectoProfile />}/>} />
              <Route path="/proyecto/:id" element={<MainLayout children={<ProyectoDetail />}/>} />
              
              {/* AI Chat - Accesible para usuarios autenticados */}
              <Route path="/ai-chat" element={<AIChatPage />} />

              <Route path="/login" element={<LoginPage/>}/>
              <Route path="/registro-cliente" element={<RegistroClientePage/>}/>
              <Route path="/registro-arquitecto" element={<RegistroArquitectoPage/>}/>
              <Route path="/registro-moderador" element={<RegistroModeradorPage/>}/>
              
              {/* Rutas Protegidas - Arquitecto */}
              <Route 
                path="/arquitecto" 
                element={
                  <ProtectedRoute requiredRole="arquitecto">
                    <ArquitectoLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/arquitecto/dashboard" element={<ArchitectDashboard />} />
                <Route path="/arquitecto/profile" element={<ArchitectDashboard />} />
                <Route path="/arquitecto/chat" element={<ArchitectChat />} />
                <Route path="/arquitecto/mis-proyectos" element={<MisProyectosArquitecto />} />
                <Route path="/arquitecto/create-project" element={<CreateProject />} />
                <Route path="/arquitecto/project/:id" element={<ArchitectProjectDetail />} />
                <Route path="/arquitecto/proyectos" element={<ArchitectDashboard />} />
              </Route>
              
              {/* Rutas Protegidas - Cliente */}
              <Route 
                path="/cliente" 
                element={
                  <ProtectedRoute requiredRole="cliente">
                    <ClienteLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/cliente/home" element={<ClienteHome />} />
                <Route path="/cliente/mis-proyectos" element={<MisProyectos />} />
                <Route path="/cliente/find-arquitectos" element={<FindArchitects />} />
                <Route path="/cliente/arquitecto/:id" element={<ArquitectoProfile />} />
                <Route path="/cliente/proyecto/:id" element={<ProyectoDetail />} />
                <Route path='/cliente/conversaciones' element={<ClientChat />} />
              </Route>

              {/* Rutas Protegidas - Moderador */}
              <Route 
                path="/moderador/dashboard" 
                element={
                  <ProtectedRoute requiredRole="moderador">
                    <ModeratorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/moderador/verificaciones" 
                element={
                  <ProtectedRoute requiredRole="moderador">
                    <Verificaciones />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/moderador/incidencias" 
                element={
                  <ProtectedRoute requiredRole="moderador">
                    <Incidencias />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/moderador/reportes" 
                element={
                  <ProtectedRoute requiredRole="moderador">
                    <Reportes />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports/:id" 
                element={<ReporteViewer />} 
              />
            </Routes>
          </Router>
        </ApolloProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
