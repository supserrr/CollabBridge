// Frontend Integration Check
// This file verifies all frontend components are properly connected

import { ENV } from '@/config';
import { useAuthStore } from '@/stores/authStore';
import { apiGet } from '@/utils/apiHelpers';
import socketService from '@/utils/socket';

interface ConnectionCheckResult {
  component: string;
  status: 'connected' | 'disconnected' | 'partial';
  details: string;
  critical: boolean;
}

export class FrontendIntegrationChecker {
  private results: ConnectionCheckResult[] = [];

  async checkAll(): Promise<ConnectionCheckResult[]> {
    this.results = [];
    
    // Check environment configuration
    this.checkEnvironment();
    
    // Check API connectivity
    await this.checkAPI();
    
    // Check authentication
    this.checkAuthentication();
    
    // Check socket connection
    this.checkSocket();
    
    // Check routing
    this.checkRouting();
    
    // Check components
    this.checkComponents();
    
    return this.results;
  }

  private checkEnvironment() {
    const missingEnvVars = [];
    
    if (!ENV.API_URL) missingEnvVars.push('API_URL');
    if (!ENV.FIREBASE.API_KEY) missingEnvVars.push('FIREBASE_API_KEY');
    if (!ENV.FIREBASE.PROJECT_ID) missingEnvVars.push('FIREBASE_PROJECT_ID');
    
    this.results.push({
      component: 'Environment Configuration',
      status: missingEnvVars.length === 0 ? 'connected' : 'partial',
      details: missingEnvVars.length === 0 
        ? 'All environment variables configured'
        : `Missing: ${missingEnvVars.join(', ')}`,
      critical: missingEnvVars.length > 0,
    });
  }

  private async checkAPI() {
    try {
      const response = await fetch(`${ENV.API_URL}/health`, {
        method: 'GET',
        timeout: 5000,
      } as RequestInit);
      
      if (response.ok) {
        this.results.push({
          component: 'API Connection',
          status: 'connected',
          details: 'Backend API is accessible',
          critical: false,
        });
      } else {
        this.results.push({
          component: 'API Connection',
          status: 'partial',
          details: `API responded with status ${response.status}`,
          critical: true,
        });
      }
    } catch (error) {
      this.results.push({
        component: 'API Connection',
        status: 'disconnected',
        details: `API unreachable: ${error instanceof Error ? error.message : 'Unknown error'}`,
        critical: true,
      });
    }
  }

  private checkAuthentication() {
    const authStore = useAuthStore.getState();
    
    let status: 'connected' | 'disconnected' | 'partial' = 'disconnected';
    let details = '';
    
    if (authStore.user && authStore.token) {
      status = 'connected';
      details = `User authenticated: ${authStore.user.name}`;
    } else if (localStorage.getItem('authToken')) {
      status = 'partial';
      details = 'Auth token exists but user not in store';
    } else {
      status = 'disconnected';
      details = 'No authentication found';
    }
    
    this.results.push({
      component: 'Authentication',
      status,
      details,
      critical: false, // Auth is not critical for all pages
    });
  }

  private checkSocket() {
    const isConnected = socketService.isConnected;
    
    this.results.push({
      component: 'Socket.IO Connection',
      status: isConnected ? 'connected' : 'disconnected',
      details: isConnected ? 'Real-time connection active' : 'Socket not connected',
      critical: false, // Socket is not critical for basic functionality
    });
  }

  private checkRouting() {
    const currentPath = window.location.pathname;
    const validPaths = [
      '/',
      '/auth/login',
      '/auth/register',
      '/dashboard',
      '/events',
      '/messages',
      '/browse-professionals',
      '/profile',
      '/how-it-works',
      '/pricing',
    ];
    
    const isValidPath = validPaths.includes(currentPath) || currentPath.startsWith('/events/');
    
    this.results.push({
      component: 'Routing',
      status: isValidPath ? 'connected' : 'partial',
      details: isValidPath ? `Valid route: ${currentPath}` : `Unknown route: ${currentPath}`,
      critical: false,
    });
  }

  private checkComponents() {
    const componentChecks = [
      {
        name: 'Header Component',
        check: () => document.getElementById('header-auth') !== null,
      },
      {
        name: 'Dashboard Component',
        check: () => document.getElementById('dashboard-container') !== null,
      },
      {
        name: 'Messages Component',
        check: () => document.getElementById('messages-container') !== null,
      },
      {
        name: 'Events Component',
        check: () => document.getElementById('events-container') !== null,
      },
    ];
    
    componentChecks.forEach(({ name, check }) => {
      const isPresent = check();
      this.results.push({
        component: name,
        status: isPresent ? 'connected' : 'disconnected',
        details: isPresent ? 'Component mounted successfully' : 'Component container not found',
        critical: false,
      });
    });
  }

  getConnectionScore(): number {
    const totalChecks = this.results.length;
    const connectedChecks = this.results.filter(r => r.status === 'connected').length;
    const partialChecks = this.results.filter(r => r.status === 'partial').length;
    
    return Math.round(((connectedChecks + partialChecks * 0.5) / totalChecks) * 100);
  }

  getCriticalIssues(): ConnectionCheckResult[] {
    return this.results.filter(r => r.critical && r.status !== 'connected');
  }

  generateReport(): string {
    const score = this.getConnectionScore();
    const criticalIssues = this.getCriticalIssues();
    
    let report = `CollabBridge Frontend Connection Report\n`;
    report += `==========================================\n\n`;
    report += `Overall Connection Score: ${score}%\n\n`;
    
    if (criticalIssues.length > 0) {
      report += `Critical Issues (${criticalIssues.length}):\n`;
      criticalIssues.forEach(issue => {
        report += `❌ ${issue.component}: ${issue.details}\n`;
      });
      report += `\n`;
    }
    
    report += `Detailed Results:\n`;
    report += `-----------------\n`;
    
    this.results.forEach(result => {
      const icon = result.status === 'connected' ? '✅' : 
                   result.status === 'partial' ? '⚠️' : '❌';
      report += `${icon} ${result.component}: ${result.details}\n`;
    });
    
    return report;
  }
}

// Export a singleton instance
export const frontendChecker = new FrontendIntegrationChecker();

// Auto-run check in development
if (ENV.IS_DEVELOPMENT) {
  window.addEventListener('load', async () => {
    const results = await frontendChecker.checkAll();
    const report = frontendChecker.generateReport();
    
    console.log('%c' + report, 'font-family: monospace; font-size: 12px;');
    
    const score = frontendChecker.getConnectionScore();
    const criticalIssues = frontendChecker.getCriticalIssues();
    
    if (score === 100) {
      console.log('%c🎉 Frontend is 100% connected!', 'color: green; font-weight: bold; font-size: 16px;');
    } else if (criticalIssues.length === 0) {
      console.log(`%c✅ Frontend is ${score}% connected with minor issues`, 'color: orange; font-weight: bold; font-size: 14px;');
    } else {
      console.log(`%c⚠️ Frontend is ${score}% connected with ${criticalIssues.length} critical issues`, 'color: red; font-weight: bold; font-size: 14px;');
    }
  });
}

export default frontendChecker;
