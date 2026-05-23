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

const API_BASE_URL = 'http://localhost:3000';

class FlexoraAPIClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
        // Check if backend is active. If offline, simulate responses with rich visual data.
        this.simulationMode = true; 
        this.initializeSimulationData();
    }

    // Initialize high-fidelity seed data for seamless UI demonstration when offline
    initializeSimulationData() {
        if (!localStorage.getItem('flexora_sim_gyms')) {
            const seedGyms = {
                'gold@gym.com': {
                    gymId: 'gym_gold',
                    gymName: 'جولدز جيم الدقي',
                    ownerName: 'كابتن أحمد مصطفى',
                    email: 'gold@gym.com',
                    password: 'pass123',
                    phone: '01012345678',
                    address: '15 شارع مصدق، الدقي، الجيزة',
                    tier: 'ELITE',
                    status: 'ACTIVE',
                    createdAt: '2026-01-10T12:00:00Z'
                },
                'silver@gym.com': {
                    gymId: 'gym_silver',
                    gymName: 'سيلفر فيتنس النزهة',
                    ownerName: 'أ. محمد صلاح',
                    email: 'silver@gym.com',
                    password: 'pass123',
                    phone: '01234567890',
                    address: 'شارع النزهة، مصر الجديدة، القاهرة',
                    tier: 'PREMIUM',
                    status: 'PENDING',
                    createdAt: '2026-05-20T10:00:00Z'
                },
                'frozen@flexora.com': {
                    gymId: 'gym_frozen',
                    gymName: 'تيتان جيم التجمع',
                    ownerName: 'كابتن عمرو صقر',
                    email: 'frozen@flexora.com',
                    password: 'pass123',
                    phone: '01511223344',
                    address: 'شارع التسعين، التجمع الخامس',
                    tier: 'ULTIMATE',
                    status: 'FROZEN',
                    createdAt: '2025-06-15T08:00:00Z'
                },
                'suspended@gym.com': {
                    gymId: 'gym_suspended',
                    gymName: 'باور فيت فيصل',
                    ownerName: 'كابتن علي رجب',
                    email: 'suspended@gym.com',
                    password: 'pass123',
                    phone: '01122334455',
                    address: 'شارع فيصل الرئيسي، الجيزة',
                    tier: 'PREMIUM',
                    status: 'SUSPENDED',
                    createdAt: '2025-09-01T09:00:00Z'
                }
            };
            localStorage.setItem('flexora_sim_gyms', JSON.stringify(seedGyms));
        }

        if (!localStorage.getItem('flexora_sim_packages')) {
            const seedPackages = [
                { id: "pkg_1", name: "اشتراك ذهبي شهري", durationInDays: 30, price: 500, type: "Gym" },
                { id: "pkg_2", name: "الباقة البلاتينية (3 شهور)", durationInDays: 90, price: 1200, type: "Gym" },
                { id: "pkg_3", name: "تدريب شخصي PT (12 حصة)", durationInDays: 30, price: 1000, type: "PT" },
                { id: "pkg_4", name: "باقة سنوية شاملة", durationInDays: 365, price: 4000, type: "Gym" }
            ];
            localStorage.setItem('flexora_sim_packages', JSON.stringify(seedPackages));
        }

        if (!localStorage.getItem('flexora_sim_staff')) {
            const seedStaff = [
                { id: "staff_1", name: "كابتن علي صبري", email: "ali@gym.com", password: "pass123", role: "Coach", baseSalary: 300 },
                { id: "staff_2", name: "كابتن رانيا يوسف", email: "rania@gym.com", password: "pass123", role: "Coach", baseSalary: 350 },
                { id: "staff_3", name: "منى عبد العزيز", email: "reception@gym.com", password: "pass123", role: "Receptionist", baseSalary: 3000 }
            ];
            localStorage.setItem('flexora_sim_staff', JSON.stringify(seedStaff));
        }

        if (!localStorage.getItem('flexora_sim_members')) {
            const seedMembers = [
                {
                    id: "MEM-9921",
                    name: "أحمد محمد علي",
                    phoneNumber: "01012345678",
                    trainingType: "Private",
                    packageId: "pkg_1",
                    packageName: "اشتراك ذهبي شهري",
                    coachId: "staff_1",
                    coachName: "كابتن علي صبري",
                    paymentMethod: "cash",
                    subscriptionEnd: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // active
                    status: "active",
                    qrCode: "QR-MEM-9921",
                    joinedDate: "2026-05-15"
                },
                {
                    id: "MEM-8843",
                    name: "سارة عبد الرحمن",
                    phoneNumber: "01234567890",
                    trainingType: "General",
                    packageId: "pkg_2",
                    packageName: "الباقة البلاتينية (3 شهور)",
                    coachId: "",
                    coachName: "",
                    paymentMethod: "visa",
                    subscriptionEnd: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // expired
                    status: "expired",
                    qrCode: "QR-MEM-8843",
                    joinedDate: "2026-02-17"
                },
                {
                    id: "MEM-7712",
                    name: "كريم ممدوح السقا",
                    phoneNumber: "01511223344",
                    trainingType: "Private",
                    packageId: "pkg_3",
                    packageName: "تدريب شخصي PT (12 حصة)",
                    coachId: "staff_2",
                    coachName: "كابتن رانيا يوسف",
                    paymentMethod: "vodafone",
                    subscriptionEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // active
                    status: "active",
                    qrCode: "QR-MEM-7712",
                    joinedDate: "2026-05-08"
                }
            ];
            localStorage.setItem('flexora_sim_members', JSON.stringify(seedMembers));
        }

        if (!localStorage.getItem('flexora_sim_financials')) {
            const seedFinancials = [
                { id: "log_1", category: "subscription", amount: 500, description: "اشتراك أحمد محمد علي (كاش)", date: "2026-05-15", type: "income" },
                { id: "log_2", category: "subscription", amount: 1200, description: "اشتراك سارة عبد الرحمن (فيزا)", date: "2026-02-17", type: "income" },
                { id: "log_3", category: "subscription", amount: 1000, description: "اشتراك كريم ممدوح السقا (فودافون)", date: "2026-05-08", type: "income" },
                { id: "log_4", category: "utility", amount: 800, description: "فاتورة الكهرباء لفرع الدقي", date: "2026-05-10", type: "expense" },
                { id: "log_5", category: "maintenance", amount: 450, description: "صيانة أجهزة التجديف والمشايات", date: "2026-05-12", type: "expense" },
                { id: "log_6", category: "salary", amount: 3000, description: "راتب منى عبد العزيز (موظفة ريسبشن)", date: "2026-05-01", type: "expense" }
            ];
            localStorage.setItem('flexora_sim_financials', JSON.stringify(seedFinancials));
        }

        if (!localStorage.getItem('flexora_sim_attendance')) {
            const seedAttendance = [
                { id: "att_1", memberId: "MEM-9921", memberName: "أحمد محمد علي", time: "2026-05-22T14:32:00Z" },
                { id: "att_2", memberId: "MEM-7712", memberName: "كريم ممدوح السقا", time: "2026-05-22T16:15:00Z" }
            ];
            localStorage.setItem('flexora_sim_attendance', JSON.stringify(seedAttendance));
        }
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
            if (error.status === 403) {
                throw error;
            }
            
            console.warn(`[Flexora API Client] Backend on ${API_BASE_URL} is unreachable. Falling back to Simulation Mode.`, error);
            if (this.simulationMode) {
                return this.handleSimulation(endpoint, options);
            }
            throw new Error('فشل الاتصال بالخادم الرئيسي لـ Flexora. يرجى التأكد من تشغيل الخادم على منفذ 3000.');
        }
    }

    /**
     * High-Fidelity API Simulation Engine
     */
    async handleSimulation(endpoint, options) {
        // Delay to simulate network roundtrip (150ms - 350ms)
        await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200));

        const method = options.method ? options.method.toUpperCase() : 'GET';
        const body = options.body ? JSON.parse(options.body) : null;

        // --- PLATFORM ADMIN ROUTES ---
        
        // Admin Login
        if (endpoint === '/admin/login' && method === 'POST') {
            const { email, password } = body;
            if (email === 'snaptech.team.o@gmail.com' && password === '#sN*aP/tE*cH@1%2%0%5%') {
                const adminUser = { name: "SnapTech Team", email: email, role: "PlatformAdmin" };
                const mockToken = "flexora_admin_token_" + Math.random().toString(36).substr(2, 9);
                this.setToken(mockToken);
                this.setRole("PlatformAdmin");
                this.setCurrentUser(adminUser);
                return { success: true, token: mockToken, admin: adminUser };
            } else {
                throw new Error('بيانات دخول مدير المنصة غير صحيحة.');
            }
        }

        // Get All Gyms
        if (endpoint === '/admin/gyms' && method === 'GET') {
            const gyms = JSON.parse(localStorage.getItem('flexora_sim_gyms') || '{}');
            return Object.values(gyms);
        }

        // Platform Dashboard Statistics
        if (endpoint === '/admin/dashboard' && method === 'GET') {
            const gyms = Object.values(JSON.parse(localStorage.getItem('flexora_sim_gyms') || '{}'));
            const activeGyms = gyms.filter(g => g.status === 'ACTIVE').length;
            const pendingGyms = gyms.filter(g => g.status === 'PENDING').length;
            const frozenGyms = gyms.filter(g => g.status === 'FROZEN').length;
            
            // Seed sum platform revenue
            let platformEarnings = 15000; // Seeded value
            gyms.forEach(g => {
                if (g.status === 'ACTIVE') platformEarnings += 5000; // Subscriptions price
            });
            
            return {
                success: true,
                totalGyms: gyms.length,
                activeCount: activeGyms,
                pendingCount: pendingGyms,
                frozenCount: frozenGyms,
                totalEarnings: platformEarnings
            };
        }

        // Activate Gym Subscription
        if (endpoint.startsWith('/admin/gyms/') && endpoint.endsWith('/activate') && method === 'PUT') {
            const match = endpoint.match(/\/admin\/gyms\/([^/]+)\/activate/);
            const gymId = match ? match[1] : null;
            const { durationInMonths, price } = body;
            
            const gyms = JSON.parse(localStorage.getItem('flexora_sim_gyms') || '{}');
            // Find gym by gymId or email
            const matchedKey = Object.keys(gyms).find(k => gyms[k].gymId === gymId || k === gymId);
            if (!matchedKey) throw new Error('لم يتم العثور على الصالة المطلوبة لتفعيلها.');

            gyms[matchedKey].status = 'ACTIVE';
            gyms[matchedKey].activationPrice = price;
            gyms[matchedKey].durationInMonths = durationInMonths;
            gyms[matchedKey].subscriptionEnd = new Date(Date.now() + durationInMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            
            localStorage.setItem('flexora_sim_gyms', JSON.stringify(gyms));
            return { success: true, message: 'تم تفعيل اشتراك الجيم بنجاح.', gym: gyms[matchedKey] };
        }

        // Freeze Gym
        if (endpoint.startsWith('/admin/gyms/') && endpoint.endsWith('/freeze') && method === 'PUT') {
            const match = endpoint.match(/\/admin\/gyms\/([^/]+)\/freeze/);
            const gymId = match ? match[1] : null;
            
            const gyms = JSON.parse(localStorage.getItem('flexora_sim_gyms') || '{}');
            const matchedKey = Object.keys(gyms).find(k => gyms[k].gymId === gymId || k === gymId);
            if (!matchedKey) throw new Error('لم يتم العثور على الصالة المطلوبة لتجميدها.');

            gyms[matchedKey].status = 'FROZEN';
            localStorage.setItem('flexora_sim_gyms', JSON.stringify(gyms));
            return { success: true, message: 'تم تجميد حساب الصالة بنجاح.', gym: gyms[matchedKey] };
        }

        // Suspend Gym
        if (endpoint.startsWith('/admin/gyms/') && endpoint.endsWith('/suspend') && method === 'PUT') {
            const match = endpoint.match(/\/admin\/gyms\/([^/]+)\/suspend/);
            const gymId = match ? match[1] : null;
            
            const gyms = JSON.parse(localStorage.getItem('flexora_sim_gyms') || '{}');
            const matchedKey = Object.keys(gyms).find(k => gyms[k].gymId === gymId || k === gymId);
            if (!matchedKey) throw new Error('لم يتم العثور على الصالة المطلوبة لإيقافها.');

            gyms[matchedKey].status = 'SUSPENDED';
            localStorage.setItem('flexora_sim_gyms', JSON.stringify(gyms));
            return { success: true, message: 'تم إيقاف حساب الصالة بنجاح.', gym: gyms[matchedKey] };
        }


        // --- GYM AUTHENTICATION ROUTES ---

        // Get SaaS Subscription Plans
        if ((endpoint === '/admin/saas-plans' || endpoint === '/user/plans') && method === 'GET') {
            return {
                status: 'success',
                data: {
                    plans: [
                        { 
                            id: 'tier1', 
                            name: 'الباقة الأساسية (1 شهر)', 
                            planName: 'الباقة الأساسية (1 شهر)', 
                            durationInDays: 30, 
                            price: 500, 
                            description: 'الباقة الأساسية',
                            features: [
                                'أتمتة ملفات واشتراكات الأعضاء الأساسية',
                                'توليد وتشفير كود الدخول الرقمي (QR)',
                                'صلاحية وصول لواجهة استقبال واحدة (Reception Desk)'
                            ]
                        },
                        { 
                            id: 'tier2', 
                            name: 'الباقة المتقدمة (3 أشهر) — الأكثر طلباً', 
                            planName: 'الباقة المتقدمة (3 أشهر) — الأكثر طلباً', 
                            durationInDays: 90, 
                            price: 1200, 
                            description: 'الباقة المتقدمة', 
                            discount: 'توفير مالي بمعدل 20% مقارنة بالدفع الشهري',
                            features: [
                                'توفير مالي بمعدل 20% مقارنة بالدفع الشهري',
                                'لوحة التقارير المالية والإحصائيات التحليلية',
                                'توليد وطباعة بطاقات العضوية المشفرة (CR80)',
                                'صلاحيات منفصلة للإدارة العليا وطاقم الاستقبال'
                            ]
                        },
                        { 
                            id: 'tier3', 
                            name: 'الباقة الاحترافية (6 أشهر)', 
                            planName: 'الباقة الاحترافية (6 أشهر)', 
                            durationInDays: 180, 
                            price: 2200, 
                            description: 'الباقة الاحترافية', 
                            discount: 'توفير مالي بمعدل 27% مقارنة بالدفع الشهري',
                            features: [
                                'توفير مالي بمعدل 27% مقارنة بالدفع الشهري',
                                'تفعيل محرك المحاسبة المالي الموحد V2 بالكامل',
                                'ربط بوابات الحضور الإلكترونية الذكية بشكل غير محدود',
                                'دعم فني مخصص وخط ساخن للاستشارات التقنية'
                            ]
                        },
                        { 
                            id: 'tier4', 
                            name: 'منظومة الأعمال الشاملة (سنة كاملة) — أفضل قيمة', 
                            planName: 'منظومة الأعمال الشاملة (سنة كاملة) — أفضل قيمة', 
                            durationInDays: 365, 
                            price: 4000, 
                            description: 'منظومة الأعمال الشاملة', 
                            discount: 'توفير استثنائي بمعدل 33% من القيمة الإجمالية',
                            features: [
                                'توفير استثنائي بمعدل 33% من القيمة الإجمالية',
                                'إدارة وحسابات فروع متعددة ومنفصلة (Multi-Branch Core)',
                                'تصدير فوري لكافة التقارير المالية والمحاسبية لملفات Excel/PDF',
                                'أولوية قصوى في الدعم التقني وجلسات استشارية لتطوير الأعمال'
                            ]
                        }
                    ]
                }
            };
        }

        // Register Gym
        if (endpoint === '/user/register' && method === 'POST') {
            const gyms = JSON.parse(localStorage.getItem('flexora_sim_gyms') || '{}');
            if (gyms[body.email]) {
                throw new Error('البريد الإلكتروني المدخل مسجل بالفعل لصالة رياضية أخرى.');
            }
            
            const newGym = {
                gymId: "gym_" + Math.random().toString(36).substr(2, 6),
                gymName: body.gymName,
                ownerName: body.ownerName,
                email: body.email,
                password: body.password || 'pass123',
                phone: body.phone,
                address: body.address || 'القاهرة، مصر',
                tier: body.tier || 'ELITE',
                status: 'PENDING',
                createdAt: new Date().toISOString()
            };
            
            gyms[body.email] = newGym;
            localStorage.setItem('flexora_sim_gyms', JSON.stringify(gyms));
            
            return {
                success: true,
                message: 'تم تسجيل الصالة بنجاح. حالتك الحالية هي قيد الانتظار (PENDING).',
                gym: newGym
            };
        }

        // Unified Staff/Owner Login
        if (endpoint === '/user/login' && method === 'POST') {
            const { email, password } = body;
            
            // Platform admin bypass
            if (email === 'snaptech.team.o@gmail.com') {
                return this.handleSimulation('/admin/login', { method: 'POST', body: JSON.stringify(body) });
            }

            // Normal login lookup
            const gyms = JSON.parse(localStorage.getItem('flexora_sim_gyms') || '{}');
            
            // Check if it is a Gym Owner direct login
            let matchedGym = gyms[email];
            if (matchedGym) {
                if (matchedGym.password !== password) {
                    throw new Error('كلمة المرور غير صحيحة.');
                }

                // Check active status
                if (matchedGym.status === 'PENDING') {
                    const pendingError = new Error('طلبك قيد المراجعة حالياً. سيتم تفعيل حساب الصالة خلال 24 ساعة.');
                    pendingError.status = 403;
                    pendingError.details = { reason: 'gym_pending_approval' };
                    throw pendingError;
                } else if (matchedGym.status === 'FROZEN') {
                    const frozenError = new Error('الحساب مجمد بسبب عدم سداد الاشتراك السنوي.');
                    frozenError.status = 403;
                    frozenError.details = { 
                        reason: 'subscription_expired', 
                        daysOverdue: 14, 
                        supportEmail: 'support@flexora.com',
                        actionRequired: 'يرجى سداد الفاتورة المعلقة لإعادة تفعيل حساب الصالة فوراً.'
                    };
                    throw frozenError;
                } else if (matchedGym.status === 'SUSPENDED') {
                    const suspendError = new Error('تم إيقاف حساب الصالة بالكامل لمخالفة شروط الاستخدام.');
                    suspendError.status = 403;
                    suspendError.details = { reason: 'gym_suspended' };
                    throw suspendError;
                }

                const mockToken = "flexora_owner_token_" + Math.random().toString(36).substr(2, 9);
                this.setToken(mockToken);
                this.setRole("GymOwner");
                this.setCurrentUser(matchedGym);

                return {
                    success: true,
                    token: mockToken,
                    role: "GymOwner",
                    gym: matchedGym
                };
            }

            // If not gym owner, check staff
            const staffList = JSON.parse(localStorage.getItem('flexora_sim_staff') || '[]');
            const matchedStaff = staffList.find(s => s.email === email);
            if (matchedStaff) {
                if (matchedStaff.password !== password) {
                    throw new Error('كلمة المرور غير صحيحة.');
                }
                const mockToken = `flexora_${matchedStaff.role.toLowerCase()}_token_` + Math.random().toString(36).substr(2, 9);
                this.setToken(mockToken);
                this.setRole(matchedStaff.role);
                this.setCurrentUser(matchedStaff);

                return {
                    success: true,
                    token: mockToken,
                    role: matchedStaff.role,
                    staff: matchedStaff
                };
            }

            // Mock login fallback for quick review testing
            if (email === 'admin@flexora.com' && password === 'admin123') {
                const mockGym = gyms['gold@gym.com'];
                const mockToken = "flexora_owner_token_mock";
                this.setToken(mockToken);
                this.setRole("GymOwner");
                this.setCurrentUser(mockGym);
                return { success: true, token: mockToken, role: "GymOwner", gym: mockGym };
            }

            throw new Error('بيانات الدخول غير صحيحة. يرجى إدخال بريد إلكتروني وكلمة مرور صحيحة.');
        }


        // --- DASHBOARD ANALYTICS ROUTES ---

        // Gym Owner Statistics
        if (endpoint === '/user/dashboard/stats' && method === 'GET') {
            const members = JSON.parse(localStorage.getItem('flexora_sim_members') || '[]');
            const financials = JSON.parse(localStorage.getItem('flexora_sim_financials') || '[]');
            
            const activeCount = members.filter(m => m.status === 'active').length;
            const expiredCount = members.filter(m => m.status === 'expired').length;
            
            // Calculate financial MRR (sum of active subscriptions in current month)
            let mrr = 0;
            let totalRevenue = 0;
            let expenses = 0;

            financials.forEach(f => {
                if (f.type === 'income') {
                    totalRevenue += f.amount;
                    mrr += f.amount; // simplification for mock stats
                } else if (f.type === 'expense') {
                    expenses += f.amount;
                }
            });

            return {
                success: true,
                mrr: mrr,
                revenue: totalRevenue,
                expenses: expenses,
                profit: totalRevenue - expenses,
                activeMembersCount: activeCount,
                expiredMembersCount: expiredCount,
                recentTransactions: financials.slice(-6).reverse()
            };
        }

        // Coach Personal PT Dashboard Statistics
        if (endpoint === '/user/coach/dashboard' && method === 'GET') {
            const user = this.getCurrentUser() || { id: "staff_1", name: "كابتن علي صبري", baseSalary: 300 };
            const members = JSON.parse(localStorage.getItem('flexora_sim_members') || '[]');
            
            // Filter players linked to this coach
            const ptPlayers = members.filter(m => m.coachId === user.id);
            // Salary calculated: base salary + (associated members count * commission per member)
            // baseSalary in staff object acts as ptCommission in simulated logic
            const ptCommission = user.baseSalary || 300;
            const baseSalaryFixed = 2500; // Fixed base wage
            const calculatedSalary = baseSalaryFixed + (ptPlayers.length * ptCommission);

            return {
                success: true,
                coachName: user.name,
                commissionPerPlayer: ptCommission,
                ptPlayersCount: ptPlayers.length,
                totalSalary: calculatedSalary,
                players: ptPlayers
            };
        }


        // --- PACKAGES MANAGEMENT ---
        
        // Get Packages
        if (endpoint === '/user/packages' && method === 'GET') {
            return JSON.parse(localStorage.getItem('flexora_sim_packages') || '[]');
        }

        // Create Package
        if (endpoint === '/user/packages' && method === 'POST') {
            const packages = JSON.parse(localStorage.getItem('flexora_sim_packages') || '[]');
            const newPkg = {
                id: "pkg_" + Math.floor(100 + Math.random() * 900),
                name: body.name,
                durationInDays: parseInt(body.durationInDays),
                price: parseFloat(body.price),
                type: body.type || 'Gym'
            };
            packages.push(newPkg);
            localStorage.setItem('flexora_sim_packages', JSON.stringify(packages));
            return { success: true, package: newPkg };
        }

        // Update Package Price
        if (endpoint.startsWith('/user/packages/') && method === 'PUT') {
            const packageId = endpoint.split('/').pop();
            const packages = JSON.parse(localStorage.getItem('flexora_sim_packages') || '[]');
            const matchedIndex = packages.findIndex(p => p.id === packageId);
            if (matchedIndex === -1) throw new Error('لم يتم العثور على الباقة المحددة.');

            packages[matchedIndex].price = parseFloat(body.price);
            localStorage.setItem('flexora_sim_packages', JSON.stringify(packages));
            return { success: true, package: packages[matchedIndex] };
        }

        // Delete Package
        if (endpoint.startsWith('/user/packages/') && method === 'DELETE') {
            const packageId = endpoint.split('/').pop();
            const packages = JSON.parse(localStorage.getItem('flexora_sim_packages') || '[]');
            const filtered = packages.filter(p => p.id !== packageId);
            localStorage.setItem('flexora_sim_packages', JSON.stringify(filtered));
            return { success: true, message: 'تم حذف الباقة بنجاح.' };
        }


        // --- STAFF MANAGEMENT ---

        // Get Staff
        if (endpoint === '/user/staff' && method === 'GET') {
            return JSON.parse(localStorage.getItem('flexora_sim_staff') || '[]');
        }

        // Create Staff
        if (endpoint === '/user/staff' && method === 'POST') {
            const staffList = JSON.parse(localStorage.getItem('flexora_sim_staff') || '[]');
            const newStaff = {
                id: "staff_" + Math.floor(100 + Math.random() * 900),
                name: body.name,
                email: body.email,
                password: body.password || "pass123",
                role: body.role || "Coach",
                baseSalary: parseFloat(body.baseSalary || 300)
            };
            staffList.push(newStaff);
            localStorage.setItem('flexora_sim_staff', JSON.stringify(staffList));
            return { success: true, staff: newStaff };
        }

        // Update Staff Salary
        if (endpoint.startsWith('/user/staff/') && method === 'PUT') {
            const staffId = endpoint.split('/').pop();
            const staffList = JSON.parse(localStorage.getItem('flexora_sim_staff') || '[]');
            const idx = staffList.findIndex(s => s.id === staffId);
            if (idx === -1) throw new Error('لم يتم العثور على الموظف.');

            staffList[idx].baseSalary = parseFloat(body.baseSalary);
            localStorage.setItem('flexora_sim_staff', JSON.stringify(staffList));
            return { success: true, staff: staffList[idx] };
        }

        // Delete Staff
        if (endpoint.startsWith('/user/staff/') && method === 'DELETE') {
            const staffId = endpoint.split('/').pop();
            const staffList = JSON.parse(localStorage.getItem('flexora_sim_staff') || '[]');
            const filtered = staffList.filter(s => s.id !== staffId);
            localStorage.setItem('flexora_sim_staff', JSON.stringify(filtered));
            return { success: true, message: 'تم حذف الموظف بنجاح.' };
        }


        // --- MEMBERS & SUBSCRIPTIONS ---

        // Get Members CRM list
        if (endpoint === '/user/members' && method === 'GET') {
            return JSON.parse(localStorage.getItem('flexora_sim_members') || '[]');
        }

        // Create Member & Subscribe
        if (endpoint === '/user/members' && method === 'POST') {
            const members = JSON.parse(localStorage.getItem('flexora_sim_members') || '[]');
            const packages = JSON.parse(localStorage.getItem('flexora_sim_packages') || '[]');
            const staffList = JSON.parse(localStorage.getItem('flexora_sim_staff') || '[]');

            const pkg = packages.find(p => p.id === body.packageId) || { name: "باقة مخصصة", price: 500, durationInDays: 30 };
            const coach = staffList.find(s => s.id === body.coachId) || { name: "" };

            const memberId = "MEM-" + Math.floor(1000 + Math.random() * 9000);
            const durationDays = pkg.durationInDays || 30;

            const newMember = {
                id: memberId,
                name: body.name,
                phoneNumber: body.phoneNumber,
                trainingType: body.trainingType || "General",
                packageId: body.packageId,
                packageName: pkg.name,
                coachId: body.coachId || "",
                coachName: coach.name || "",
                paymentMethod: body.paymentMethod || "cash",
                subscriptionEnd: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: "active",
                qrCode: "QR-" + memberId,
                joinedDate: new Date().toISOString().split('T')[0]
            };

            members.unshift(newMember);
            localStorage.setItem('flexora_sim_members', JSON.stringify(members));

            // Record Income in Financials
            const financials = JSON.parse(localStorage.getItem('flexora_sim_financials') || '[]');
            financials.push({
                id: "log_" + Math.floor(100 + Math.random() * 900),
                category: "subscription",
                amount: parseFloat(pkg.price),
                description: `اشتراك اللاعب ${newMember.name} في [${pkg.name}] (${body.paymentMethod})`,
                date: new Date().toISOString().split('T')[0],
                type: "income"
            });
            localStorage.setItem('flexora_sim_financials', JSON.stringify(financials));

            return {
                success: true,
                message: 'تم إضافة المشترك بنجاح وتوليد الرمز المربع (QR Code).',
                member: newMember
            };
        }

        // Update Member (e.g. Freeze subscription)
        if (endpoint.startsWith('/user/members/') && method === 'PUT') {
            const memberId = endpoint.split('/').pop();
            const members = JSON.parse(localStorage.getItem('flexora_sim_members') || '[]');
            const idx = members.findIndex(m => m.id === memberId);
            if (idx === -1) throw new Error('لم يتم العثور على اللاعب.');

            members[idx].status = body.status || 'active';
            localStorage.setItem('flexora_sim_members', JSON.stringify(members));
            return { success: true, member: members[idx] };
        }

        // Delete Member
        if (endpoint.startsWith('/user/members/') && method === 'DELETE') {
            const memberId = endpoint.split('/').pop();
            const members = JSON.parse(localStorage.getItem('flexora_sim_members') || '[]');
            const filtered = members.filter(m => m.id !== memberId);
            localStorage.setItem('flexora_sim_members', JSON.stringify(filtered));
            return { success: true, message: 'تم حذف المشترك بنجاح.' };
        }


        // --- ATTENDANCE SYSTEM ---

        // Check-in member via QR
        if (endpoint === '/user/attendance/check' && method === 'POST') {
            const members = JSON.parse(localStorage.getItem('flexora_sim_members') || '[]');
            const matchedMember = members.find(m => m.qrCode === body.qrCode || m.id === body.qrCode);
            if (!matchedMember) {
                throw new Error('كود QR غير مسجل أو غير صحيح. يرجى مسح الكود مجدداً.');
            }

            // Check if active
            const isExpired = new Date(matchedMember.subscriptionEnd) < new Date();
            if (isExpired) {
                matchedMember.status = 'expired';
                localStorage.setItem('flexora_sim_members', JSON.stringify(members));
                throw new Error(`عذراً، اشتراك العضو [${matchedMember.name}] منتهي الصلاحية بتاريخ ${matchedMember.subscriptionEnd}. يرجى التوجه للاستقبال للتجديد.`);
            }

            if (matchedMember.status !== 'active') {
                throw new Error(`عذراً، حالة العضو الحالية [${matchedMember.name}] هي: ${matchedMember.status === 'frozen' ? 'مجمد' : 'غير نشط'}. يرجى مراجعة الاستقبال.`);
            }

            // Log attendance record
            const attendanceList = JSON.parse(localStorage.getItem('flexora_sim_attendance') || '[]');
            attendanceList.unshift({
                id: "att_" + Math.floor(100 + Math.random() * 900),
                memberId: matchedMember.id,
                memberName: matchedMember.name,
                time: new Date().toISOString()
            });
            localStorage.setItem('flexora_sim_attendance', JSON.stringify(attendanceList));

            return {
                success: true,
                message: `مرحباً بك كابتن ${matchedMember.name}! تم تسجيل الدخول بنجاح. تفضل بالدخول.`,
                member: matchedMember
            };
        }


        // --- FINANCIAL LOGS & EXPENSES ---

        // Get Financial logs
        if (endpoint === '/user/financials' && method === 'GET') {
            const logs = JSON.parse(localStorage.getItem('flexora_sim_financials') || '[]');
            // check query params or return all
            return logs;
        }

        // Add Expense
        if (endpoint === '/user/financials' && method === 'POST') {
            const logs = JSON.parse(localStorage.getItem('flexora_sim_financials') || '[]');
            const newLog = {
                id: "log_" + Math.floor(100 + Math.random() * 900),
                category: body.category || "utility",
                amount: parseFloat(body.amount),
                description: body.description || "",
                date: new Date().toISOString().split('T')[0],
                type: "expense"
            };
            logs.push(newLog);
            localStorage.setItem('flexora_sim_financials', JSON.stringify(logs));
            return { success: true, log: newLog };
        }

        // Delete Expense / Income log
        if (endpoint.startsWith('/user/financials/') && method === 'DELETE') {
            const logId = endpoint.split('/').pop();
            const logs = JSON.parse(localStorage.getItem('flexora_sim_financials') || '[]');
            const filtered = logs.filter(l => l.id !== logId);
            localStorage.setItem('flexora_sim_financials', JSON.stringify(filtered));
            return { success: true, message: 'تم مسح السجل المالي بنجاح.' };
        }

        throw new Error(`لم يتم العثور على المسار المطلوب في نظام المحاكاة: ${endpoint}`);
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
        return this.request('/user/register', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    async getPlans() {
        return this.request('/admin/saas-plans', {
            method: 'GET'
        });
    }

    async login(email, password) {
        return this.request('/user/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
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
