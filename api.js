/**
 * Flexora V2 - Premium API Communication Bridge
 * Isolated Vanilla JavaScript HTTP Fetch Router targeting port 3000.
 * 
 * Featuring:
 * 1. Automatic Bearer token headers handling.
 * 2. High-fidelity dynamic Simulation Mode when backend is offline.
 * 3. Graceful handling of HTTP 403 (Frozen Gym/Staff Block) states in Arabic.
 * 4. Multi-role support for Platform Admin, Gym Owner, Receptionist, and Coach.
 */

const API_BASE_URL = 'https://elegant-playfulness-production-f153.up.railway.app';

class FlexoraAPIClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
        this.simulationMode = false; 
    }

    // Initialize high-fidelity seed data for seamless UI demonstration when offline
    initializeSimulationData() {
        // وضع المحاكاة معطل بالكامل
    }

    setToken(token) {
        localStorage.setItem('flexora_token', token);
    }

    getToken() {
        return localStorage.getItem('flexora_token');
    }

    setRole(role) {
        localStorage.setItem('flexora_role', role);
    }

    getRole() {
        return localStorage.getItem('flexora_role');
    }

    setCurrentUser(user) {
        localStorage.setItem('flexora_current_user', JSON.stringify(user));
    }

    getCurrentUser() {
        const u = localStorage.getItem('flexora_current_user');
        return u ? JSON.parse(u) : null;
    }

    logout() {
        localStorage.removeItem('flexora_token');
        localStorage.removeItem('flexora_role');
        localStorage.removeItem('flexora_current_user');
    }

    /**
     * Core Fetch Request Handler
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        // Set standard headers
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const fetchOptions = {
            ...options,
            headers
        };

        // Try direct backend integration. If offline/connection refused, trigger high-fidelity simulation mode.
        try {
            const response = await fetch(url, fetchOptions);
            
            if (response.status === 403) {
                const errorData = await response.json().catch(() => ({}));
                const blockError = new Error(errorData.message || 'عذراً، هذا الحساب مجمد أو غير مفعل حالياً.');
                blockError.status = 403;
                blockError.details = errorData;
                throw blockError;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const err = new Error(errorData.message || 'حدث خطأ غير متوقع أثناء الاتصال بالخادم.');
                err.status = response.status;
                throw err;
            }

            return await response.json();
        } catch (error) {
            if (error.status) {
                throw error;
            }
            throw new Error('عذراً، فشل الاتصال بالخادم الرئيسي لمنصة فليكسورا. يرجى التحقق من اتصال الإنترنت أو المحاولة لاحقاً.');
        }
    }

    /**
     * High-Fidelity API Simulation Engine
     */
    async handleSimulation(endpoint, options) {
        throw new Error('عفواً، تم إلغاء وضع المحاكاة تماماً. يرجى الاتصال بالخادم الرئيسي للمنصة.');
    }

    /**
     * Public Interface Actions for live + simulated calls
     */
    
    // Platform Admin Actions
    async adminLogin(email, password) {
        return this.request('/admin/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async getGyms() {
        return this.request('/admin/gyms', {
            method: 'GET'
        });
    }

    async getAdminDashboard() {
        return this.request('/admin/dashboard', {
            method: 'GET'
        });
    }

    async activateGym(gymId, durationInMonths, price) {
        return this.request(`/admin/gyms/${gymId}/activate`, {
            method: 'PUT',
            body: JSON.stringify({ durationInMonths, price })
        });
    }

    async freezeGym(gymId) {
        return this.request(`/admin/gyms/${gymId}/freeze`, {
            method: 'PUT'
        });
    }

    async suspendGym(gymId) {
        return this.request(`/admin/gyms/${gymId}/suspend`, {
            method: 'PUT'
        });
    }

    // Gym Staff Actions & Registrations
    async register(gymData) {
        const payload = {
            gymName: gymData.gymName,
            ownerName: gymData.ownerName,
            email: gymData.email,
            phoneNumber: gymData.phoneNumber || gymData.phone,
            password: gymData.password || 'pass123',
            address: gymData.address,
            planId: gymData.planId,
            promoCode: gymData.promoCode
        };
        const res = await this.request('/user/register', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        if (res && res.data && res.data.gym) {
            res.gym = res.data.gym;
            res.user = res.data.user;
        }
        return res;
    }

    async getPlans() {
        return this.request('/api/saas-plans', {
            method: 'GET'
        });
    }

    async login(email, password) {
        const endpoint = email === 'snaptech.team.o@gmail.com' ? '/admin/login' : '/user/login';
        const response = await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (response && (response.status === 'success' || response.token)) {
            const token = response.token;
            const role = response.role || response.data?.user?.role || 'Gym-Owner';
            const user = response.user || response.data?.user;
            const gym = response.gym || response.data?.gym;

            // Save for landing page API client
            this.setToken(token);
            this.setRole(role);
            if (user) {
                this.setCurrentUser(user);
            }

            // Save for React Dashboard (GymDashboard)
            localStorage.setItem('token', token);
            if (user) {
                const combinedUser = {
                    ...user,
                    role: role, // Ensure exact synced role is set
                    gymName: gym?.gymName || gym?.name || 'صالة فليكسورا الرياضية'
                };
                localStorage.setItem('user', JSON.stringify(combinedUser));
            }
        }

        return response;
    }

    // Dashboards
    async getGymOwnerStats() {
        return this.request('/user/dashboard/stats', {
            method: 'GET'
        });
    }

    async getCoachDashboard() {
        return this.request('/user/coach/dashboard', {
            method: 'GET'
        });
    }

    // Packages Management
    async getPackages() {
        return this.request('/user/packages', {
            method: 'GET'
        });
    }

    async createPackage(packageData) {
        return this.request('/user/packages', {
            method: 'POST',
            body: JSON.stringify(packageData)
        });
    }

    async updatePackage(packageId, price) {
        return this.request(`/user/packages/${packageId}`, {
            method: 'PUT',
            body: JSON.stringify({ price })
        });
    }

    async deletePackage(packageId) {
        return this.request(`/user/packages/${packageId}`, {
            method: 'DELETE'
        });
    }

    // Staff Management
    async getStaff() {
        return this.request('/user/staff', {
            method: 'GET'
        });
    }

    async createStaff(staffData) {
        return this.request('/user/staff', {
            method: 'POST',
            body: JSON.stringify(staffData)
        });
    }

    async updateStaff(staffId, baseSalary) {
        return this.request(`/user/staff/${staffId}`, {
            method: 'PUT',
            body: JSON.stringify({ baseSalary })
        });
    }

    async deleteStaff(staffId) {
        return this.request(`/user/staff/${staffId}`, {
            method: 'DELETE'
        });
    }

    // Members & Subscriptions
    async getMembers() {
        return this.request('/user/members', {
            method: 'GET'
        });
    }

    async createMember(memberData) {
        return this.request('/user/members', {
            method: 'POST',
            body: JSON.stringify(memberData)
        });
    }

    async updateMember(memberId, status) {
        return this.request(`/user/members/${memberId}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    async deleteMember(memberId) {
        return this.request(`/user/members/${memberId}`, {
            method: 'DELETE'
        });
    }

    // Attendance QR checking
    async checkAttendance(qrCode) {
        return this.request('/user/attendance/check', {
            method: 'POST',
            body: JSON.stringify({ qrCode })
        });
    }

    // Financial Logs & Expenses
    async getFinancialLogs() {
        return this.request('/user/financials', {
            method: 'GET'
        });
    }

    async addExpense(expenseData) {
        return this.request('/user/financials', {
            method: 'POST',
            body: JSON.stringify(expenseData)
        });
    }

    async deleteExpense(logId) {
        return this.request(`/user/financials/${logId}`, {
            method: 'DELETE'
        });
    }
}

// Attach client to global window scope
window.FlexoraAPI = new FlexoraAPIClient();
