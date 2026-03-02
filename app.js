const{useState,useEffect,useMemo,useCallback,useRef,createContext,useContext,memo}=React;
// ═══════════════════════════════════════════════════════════
//  MASHRO3Y v7.0 — CORE: Data, Theme, Translations, Utils
// ═══════════════════════════════════════════════════════════

// ─── CURRENCIES ─────────────────────────────────────────────
const CURRENCIES={
  USD:{s:"$",l:"en-US"},EUR:{s:"€",l:"de-DE"},GBP:{s:"£",l:"en-GB"},
  AED:{s:"د.إ",l:"ar-AE"},SAR:{s:"ر.س",l:"ar-SA"},EGP:{s:"ج.م",l:"ar-EG"},
  JPY:{s:"¥",l:"ja-JP"},CAD:{s:"CA$",l:"en-CA"},AUD:{s:"A$",l:"en-AU"},
  CHF:{s:"Fr",l:"de-CH"},KWD:{s:"د.ك",l:"ar-KW"},QAR:{s:"ر.ق",l:"ar-QA"},
  OMR:{s:"ر.ع",l:"ar-OM"},BHD:{s:"د.ب",l:"ar-BH"},JOD:{s:"د.أ",l:"ar-JO"},
};

// ─── ACCENT COLORS ──────────────────────────────────────────
const ACCENTS={
  Blue:{a:"#3B82F6",ah:"#2563EB",ag:"linear-gradient(135deg,#3B82F6,#1D4ED8)"},
  Emerald:{a:"#10B981",ah:"#059669",ag:"linear-gradient(135deg,#10B981,#047857)"},
  Gold:{a:"#F59E0B",ah:"#D97706",ag:"linear-gradient(135deg,#F59E0B,#B45309)"},
  Rose:{a:"#F43F5E",ah:"#E11D48",ag:"linear-gradient(135deg,#F43F5E,#BE123C)"},
  Purple:{a:"#8B5CF6",ah:"#7C3AED",ag:"linear-gradient(135deg,#8B5CF6,#6D28D9)"},
  Orange:{a:"#F97316",ah:"#EA580C",ag:"linear-gradient(135deg,#F97316,#C2410C)"},
  Teal:{a:"#14B8A6",ah:"#0D9488",ag:"linear-gradient(135deg,#14B8A6,#0F766E)"},
  Indigo:{a:"#6366F1",ah:"#4F46E5",ag:"linear-gradient(135deg,#6366F1,#4338CA)"},
};

function mkTheme(dark,accentName){
  const ac=ACCENTS[accentName]||ACCENTS.Blue;
  return dark?{
    bg:"#0B0E1A",bg2:"#131929",bg3:"#1C2333",bg4:"#242D42",bg5:"#2D3A55",
    tx:"#F0F4FF",tx2:"#CBD5E1",tx3:"#94A3B8",tx4:"#64748B",tx5:"#475569",
    bd:"#1E2D45",bd2:"#2D3A55",
    sh:"0 2px 12px rgba(0,0,0,.5)",sh2:"0 8px 40px rgba(0,0,0,.6)",
    card:"#131929",nav:"#0B0E1A",
    success:"#10B981",warning:"#F59E0B",danger:"#EF4444",info:"#3B82F6",
    ...ac,dark:true,
  }:{
    bg:"#F0F4FF",bg2:"#FFFFFF",bg3:"#F8FAFF",bg4:"#EEF2FF",bg5:"#E2E8FF",
    tx:"#0D1117",tx2:"#1E293B",tx3:"#475569",tx4:"#94A3B8",tx5:"#CBD5E1",
    bd:"#E2E8FF",bd2:"#C7D2FE",
    sh:"0 1px 8px rgba(99,102,241,.08)",sh2:"0 8px 32px rgba(99,102,241,.15)",
    card:"#FFFFFF",nav:"#FFFFFF",
    success:"#10B981",warning:"#F59E0B",danger:"#EF4444",info:"#3B82F6",
    ...ac,dark:false,
  };
}

// ─── UTILS ───────────────────────────────────────────────────
function fmtCur(n,cur="USD",lang="en"){
  const arCurs={AED:"ar-AE",SAR:"ar-SA",EGP:"ar-EG",KWD:"ar-KW",QAR:"ar-QA",OMR:"ar-OM",BHD:"ar-BH",JOD:"ar-JO"};
  const locale=lang==="ar"?(arCurs[cur]||"ar-SA"):"en-US";
  try{return new Intl.NumberFormat(locale,{style:"currency",currency:cur,maximumFractionDigits:2,minimumFractionDigits:0}).format(n||0);}
  catch{const c=CURRENCIES[cur]||CURRENCIES.USD;return `${c.s}${(n||0).toLocaleString(locale)}`;}
}

function fmtNum(n,dec=0){return(+(n||0)).toLocaleString("en-US",{minimumFractionDigits:dec,maximumFractionDigits:dec});}
function fmtDate(d,lang="en"){if(!d)return"—";try{const locale=lang==="ar"?"ar-EG":"en-GB";return new Date(d).toLocaleDateString(locale,{day:"2-digit",month:"short",year:"numeric",numberingSystem:"latn"});}catch{return d;}}
function fmtDateShort(d){if(!d)return"—";try{return new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",numberingSystem:"latn"});}catch{return d;}}
function today(){return new Date().toISOString().split("T")[0];}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function daysBetween(a,b){try{return Math.max(0,Math.round((new Date(b)-new Date(a))/(864e5)));}catch{return 0;}}
function monthKey(d){return(d||today()).slice(0,7);}
function monthName(m){try{return new Date(m+"-01").toLocaleDateString("en-GB",{month:"long",year:"numeric"});}catch{return m;}}
function daysInMonth(ym){const[y,m]=ym.split("-").map(Number);return new Date(y,m,0).getDate();}
function addMonths(d,n){const dt=new Date(d);dt.setMonth(dt.getMonth()+n);return dt.toISOString().split("T")[0];}
function yearsWorked(start){if(!start)return 0;return Math.floor(daysBetween(start,today())/365.25*10)/10;}

function ls(k,def=null){try{const v=localStorage.getItem(k);return v!==null?JSON.parse(v):def;}catch{return def;}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}

// ─── INVOICE HELPERS ─────────────────────────────────────────
function calcLine(line){
  const sub=(+line.qty||0)*(+line.price||0);
  const dis=sub*((+line.discount||0)/100);
  const taxable=sub-dis;
  const tax=taxable*((+line.tax||0)/100);
  return{sub,dis,taxable,tax,total:taxable+tax};
}
function calcInvTotal(inv){
  return(inv?.lines||[]).reduce((s,l)=>s+calcLine(l).total,0);
}
function calcInvBalance(inv){
  return Math.max(0,calcInvTotal(inv)-(inv?.paid||0));
}
function invStatus(inv){
  if(!inv)return"Draft";
  if(inv.status==="Cancelled"||inv.status==="Draft")return inv.status;
  const total=calcInvTotal(inv);const paid=inv.paid||0;
  if(paid>=total&&total>0)return"Paid";
  if(paid>0)return"Partial";
  if(inv.dueDate&&new Date(inv.dueDate)<new Date())return"Overdue";
  return inv.status||"Sent";
}

// ─── GRATUITY / EOSB CALCULATOR ─────────────────────────────
function calcEOSB(salary,startDate,endDate=today(),reason="resignation"){
  const years=daysBetween(startDate,endDate)/365.25;
  if(years<1)return 0;
  let days=0;
  if(reason==="termination"){
    days=years<=5?21*Math.min(years,5)+30*Math.max(0,years-5):21*5+30*(years-5);
  } else {
    // Resignation: 1-3y=1/3, 3-5y=2/3, >5y=full
    if(years<3)days=(years/3)*21*years;
    else if(years<5)days=(2/3)*21*years;
    else days=21*Math.min(years,5)+30*Math.max(0,years-5);
  }
  return Math.round((salary/30)*days);
}

// ─── LOAN AMORTIZATION ───────────────────────────────────────
function loanSchedule(principal,monthlyDeduction,startDate){
  const schedule=[];
  let remaining=principal;
  let d=startDate||today();
  while(remaining>0){
    const pmt=Math.min(monthlyDeduction,remaining);
    remaining=Math.max(0,remaining-pmt);
    schedule.push({date:d,payment:pmt,remaining,paid:pmt});
    d=addMonths(d,1);
    if(schedule.length>360)break;
  }
  return schedule;
}

// ─── TRANSLATIONS ────────────────────────────────────────────
const T={
en:{
  // App
  app:"MASHRO3Y",tagline:"Enterprise ERP v8.3",
  // Nav
  dashboard:"Dashboard",companies:"Companies",revenue:"Revenue",expenses:"Expenses",
  invoices:"Invoices",quotes:"Quotes",clients:"Clients",budget:"Budget",reports:"Reports",
  settings:"Settings",vault:"Vault",workers:"Workers",procurement:"Procurement",
  utilities:"Utilities",storage:"Cold Storage",ai:"AI Assistant",importData:"Import",
  products:"Products",crm:"CRM / Pipeline",payroll:"Payroll",
  // Actions
  add:"Add",edit:"Edit",delete:"Delete",save:"Save",cancel:"Cancel",close:"Close",
  print:"Print",export:"Export",import:"Import",search:"Search",filter:"Filter",
  confirm:"Confirm",back:"Back",next:"Next",view:"View",approve:"Approve",reject:"Reject",
  send:"Send",convert:"Convert",duplicate:"Duplicate",archive:"Archive",
  // Fields
  name:"Name",amount:"Amount",date:"Date",description:"Description",category:"Category",
  notes:"Notes",status:"Status",type:"Type",phone:"Phone",email:"Email",address:"Address",
  currency:"Currency",tax:"Tax",discount:"Discount",total:"Total",subtotal:"Subtotal",
  quantity:"Qty",price:"Unit Price",unit:"Unit",payment:"Payment",ref:"Reference",
  // Status
  paid:"Paid",pending:"Pending",overdue:"Overdue",draft:"Draft",confirmed:"Confirmed",
  cancelled:"Cancelled",active:"Active",inactive:"Inactive",partial:"Partial",
  approved:"Approved",rejected:"Rejected",open:"Open",closed:"Closed",won:"Won",lost:"Lost",
  // Finance
  income:"Income",profit:"Net Profit",margin:"Profit Margin",balance:"Balance",
  receivable:"Receivable",payable:"Payable",cashflow:"Cash Flow",
  // Invoice
  invoiceNum:"Invoice #",invoiceDate:"Invoice Date",dueDate:"Due Date",
  billTo:"Bill To",paymentTerms:"Payment Terms",lineItems:"Line Items",
  addLine:"Add Line",createInvoice:"Create Invoice",sendInvoice:"Send Invoice",
  markPaid:"Mark as Paid",registerPayment:"Register Payment",creditNote:"Credit Note",
  paymentMethod:"Payment Method",paymentRef:"Payment Reference",
  quoteNum:"Quote #",convertToInvoice:"Convert to Invoice",validUntil:"Valid Until",
  // Workers
  employee:"Employee",role:"Job Role",department:"Department",baseSalary:"Base Salary",
  joinDate:"Join Date",workStatus:"Status",addEmployee:"Add Employee",
  absence:"Absence",overtime:"Overtime",loan:"Loan",advance:"Advance",
  eosb:"End of Service",insurance:"Insurance",commission:"Commission",
  leaveBalance:"Leave Balance",loanBalance:"Loan Balance",payslip:"Payslip",
  // Payroll
  payrollMonth:"Payroll Month",runPayroll:"Run Payroll",
  grossSalary:"Gross Salary",deductions:"Deductions",additions:"Additions",
  netSalary:"Net Pay",unpaidAbsences:"Unpaid Absences",
  // Procurement
  supplier:"Supplier",purchaseOrder:"Purchase Order",
  delivery:"Delivery Date",terms:"Payment Terms",addSupplier:"Add Supplier",
  createPO:"Create PO",receiveGoods:"Receive Goods",
  // Lists
  payTermsList:["Due on Receipt","Net 7","Net 15","Net 30","Net 60","Net 90"],
  payMethodsList:["Bank Transfer","Cash","Credit Card","Cheque","Wire Transfer","PayPal","Crypto"],
  revCats:["Sales","Services","Consulting","SaaS","Rental","Storage","Export","Import","Commission","Other"],
  expCats:["Salaries","Rent","Software","Marketing","Travel","Utilities","Electricity","Equipment","Fuel","Maintenance","Procurement","Insurance","Petty Cash","Other"],
  workerDepts:["Operations","Finance","HR","Sales","IT","Logistics","Management","Legal","Marketing","Other"],
  workerStatuses:["Active","On Leave","Suspended","Terminated"],
  leaveTypes:["Annual Leave","Sick Leave","Unpaid Leave","Maternity","Paternity","Emergency","Other"],
  absenceTypes:["Absent","Late","Half Day","Sick","Annual Leave","Unpaid"],
  overtimeTypes:["Regular (1.25x)","Weekend (1.5x)","Holiday (2x)"],
  loanStatuses:["Active","Paid Off","Written Off"],
  supplierCats:["Raw Materials","Electronics","Office Supplies","Machinery","Services","Food","Chemicals","Transport","Other"],
  bankTypes:["Checking","Savings","Current","Corporate","Digital Wallet","Petty Cash"],
  procStatuses:["Draft","Sent","Confirmed","Partial","Received","Cancelled"],
  currencies:Object.keys(CURRENCIES),
  accentNames:Object.keys(ACCENTS),
  invStatusList:["Draft","Confirmed","Sent","Partial","Paid","Overdue","Cancelled"],
  pipelineStages:["Lead","Qualified","Proposal","Negotiation","Won","Lost"],
  productCats:["Software","Hardware","Services","Raw Material","Finished Good","Other"],
  storageFacTypes:["Refrigeration","Freezer","General","Hazmat","Bonded","Other"],
  // Messages
  saved:"Saved successfully ✓",deleted:"Deleted",error:"Error occurred",
  fillRequired:"Please fill all required fields",confirmDelete:"Are you sure? This cannot be undone.",
  noData:"No data yet",loading:"Loading...",
  // Dashboard
  thisMonth:"This Month",lastMonth:"Last Month",growth:"Growth",
  quickActions:"Quick Actions",recentActivity:"Recent Activity",
  outstanding:"Outstanding",burnRate:"Burn Rate",
  upcomingDue:"Due in 7 days",
  // Settings
  appearance:"Appearance",theme:"Theme",accent:"Accent Color",
  language:"Language",companySettings:"Company Settings",
  companyName:"Company Name",taxNumber:"Tax Number",
  // Misc
  yearsService:"Years of Service",gratuityEst:"Gratuity Estimate",
  loanAmount:"Loan Amount",monthlyDeduction:"Monthly Deduction",
  advanceAmount:"Advance Amount",overtimeHours:"Overtime Hours",
  insurancePolicy:"Insurance Policy",insuranceExpiry:"Policy Expiry",
  leaveEntitlement:"Annual Entitlement (days)",leaveTaken:"Days Taken",
  leaveRemaining:"Days Remaining",leaveAccrued:"Days Accrued",
  clientStatement:"Client Statement",creditLimit:"Credit Limit",
  pipeline:"Sales Pipeline",dealValue:"Deal Value",probability:"Probability %",
  activity:"Activity",followUp:"Follow Up",
  reconcile:"Reconcile",bankStatement:"Bank Statement",clientProfile:"Client Profile",supplierProfile:"Supplier Profile",globalSearch:"Global Search",notes:"Notes",documents:"Documents",transactions:"Transactions",addNote:"Add Note",noNotes:"No notes yet",searchPlaceholder:"Search invoices, clients, suppliers, workers...",searchResults:"Search Results",noResults:"No results found",
  costCenter:"Cost Center",project:"Project",
  workSchedule:"Work Schedule",shift:"Shift",
},
ar:{
  app:"مشروعي",tagline:"نظام ERP v8.3",
  dashboard:"لوحة التحكم",companies:"الشركات",revenue:"الإيرادات",expenses:"المصاريف",
  invoices:"الفواتير",quotes:"عروض الأسعار",clients:"العملاء",budget:"الميزانية",
  reports:"التقارير",settings:"الإعدادات",vault:"الخزينة",workers:"الموظفون",
  procurement:"المشتريات",utilities:"المرافق",storage:"التخزين البارد",
  ai:"المساعد الذكي",importData:"استيراد",products:"المنتجات",crm:"إدارة العملاء",payroll:"الرواتب",
  add:"إضافة",edit:"تعديل",delete:"حذف",save:"حفظ",cancel:"إلغاء",close:"إغلاق",
  print:"طباعة",export:"تصدير",import:"استيراد",search:"بحث",filter:"تصفية",
  confirm:"تأكيد",back:"رجوع",next:"التالي",view:"عرض",approve:"موافقة",reject:"رفض",
  send:"إرسال",convert:"تحويل",duplicate:"نسخ",archive:"أرشفة",
  name:"الاسم",amount:"المبلغ",date:"التاريخ",description:"الوصف",category:"الفئة",
  notes:"ملاحظات",status:"الحالة",type:"النوع",phone:"الهاتف",email:"البريد",
  address:"العنوان",currency:"العملة",tax:"الضريبة",discount:"الخصم",
  total:"الإجمالي",subtotal:"المجموع الفرعي",quantity:"الكمية",price:"سعر الوحدة",
  unit:"الوحدة",payment:"الدفع",ref:"المرجع",
  paid:"مدفوع",pending:"معلق",overdue:"متأخر",draft:"مسودة",confirmed:"مؤكد",
  cancelled:"ملغي",active:"نشط",inactive:"غير نشط",partial:"جزئي",
  approved:"موافق",rejected:"مرفوض",open:"مفتوح",closed:"مغلق",won:"رُبح",lost:"خُسر",
  income:"دخل",profit:"صافي الربح",margin:"هامش الربح",balance:"الرصيد",
  receivable:"المستحقات",payable:"الديون",cashflow:"التدفق النقدي",
  invoiceNum:"رقم الفاتورة",invoiceDate:"تاريخ الفاتورة",dueDate:"تاريخ الاستحقاق",
  billTo:"فاتورة لـ",paymentTerms:"شروط الدفع",lineItems:"بنود",addLine:"إضافة بند",
  createInvoice:"إنشاء فاتورة",sendInvoice:"إرسال فاتورة",markPaid:"تحديد مدفوع",
  registerPayment:"تسجيل دفع",creditNote:"إشعار دائن",paymentMethod:"طريقة الدفع",
  paymentRef:"مرجع الدفع",quoteNum:"رقم العرض",convertToInvoice:"تحويل لفاتورة",validUntil:"صالح حتى",
  employee:"الموظف",role:"المسمى الوظيفي",department:"القسم",baseSalary:"الراتب الأساسي",
  joinDate:"تاريخ الانضمام",workStatus:"الحالة",addEmployee:"إضافة موظف",
  absence:"غياب",overtime:"عمل إضافي",loan:"قرض",advance:"سلفة",
  eosb:"مكافأة نهاية الخدمة",insurance:"التأمين",commission:"عمولة",
  leaveBalance:"رصيد الإجازات",loanBalance:"رصيد القرض",payslip:"قسيمة الراتب",
  payrollMonth:"شهر الراتب",runPayroll:"صرف الرواتب",
  grossSalary:"الراتب الإجمالي",deductions:"الخصومات",additions:"الإضافات",
  netSalary:"صافي الراتب",unpaidAbsences:"غيابات بدون راتب",
  supplier:"المورد",purchaseOrder:"أمر الشراء",delivery:"تاريخ التسليم",
  terms:"شروط الدفع",addSupplier:"إضافة مورد",createPO:"إنشاء أمر شراء",receiveGoods:"استلام",
  payTermsList:["عند الاستلام","7 أيام","15 يوم","30 يوم","60 يوم","90 يوم"],
  payMethodsList:["تحويل بنكي","نقد","بطاقة ائتمان","شيك","حوالة","باي بال","كريبتو"],
  revCats:["مبيعات","خدمات","استشارات","SaaS","إيجار","تخزين","تصدير","استيراد","عمولة","أخرى"],
  expCats:["رواتب","إيجار","برمجيات","تسويق","سفر","مرافق","كهرباء","معدات","وقود","صيانة","مشتريات","تأمين","صندوق صغير","أخرى"],
  workerDepts:["العمليات","المالية","الموارد البشرية","المبيعات","تقنية","لوجستيات","إدارة","قانوني","تسويق","أخرى"],
  workerStatuses:["نشط","إجازة","موقوف","منتهي"],
  leaveTypes:["إجازة سنوية","إجازة مرضية","إجازة بدون راتب","أمومة","أبوة","طارئة","أخرى"],
  absenceTypes:["غياب","تأخير","نصف يوم","مريض","إجازة سنوية","بدون راتب"],
  overtimeTypes:["عادي (1.25×)","نهاية أسبوع (1.5×)","عطلة رسمية (2×)"],
  loanStatuses:["نشط","مسدد","مشطوب"],
  supplierCats:["مواد خام","إلكترونيات","مستلزمات مكتبية","آلات","خدمات","أغذية","كيماويات","نقل","أخرى"],
  bankTypes:["جاري","توفير","شركة","رقمي","صندوق صغير"],
  procStatuses:["مسودة","مرسل","مؤكد","جزئي","مستلم","ملغي"],
  currencies:Object.keys(CURRENCIES),
  accentNames:Object.keys(ACCENTS),
  invStatusList:["مسودة","مؤكدة","مرسلة","جزئية","مدفوعة","متأخرة","ملغاة"],
  pipelineStages:["عميل محتمل","مؤهل","عرض","تفاوض","ربح","خسارة"],
  productCats:["برمجيات","أجهزة","خدمات","مواد خام","منتج نهائي","أخرى"],
  storageFacTypes:["تبريد","تجميد","عام","مواد خطرة","جمركي","أخرى"],
  saved:"تم الحفظ ✓",deleted:"تم الحذف",error:"حدث خطأ",
  fillRequired:"أكمل الحقول المطلوبة",confirmDelete:"هل أنت متأكد؟",
  noData:"لا توجد بيانات",loading:"جاري التحميل...",
  thisMonth:"هذا الشهر",lastMonth:"الشهر الماضي",growth:"النمو",
  quickActions:"إجراءات سريعة",recentActivity:"النشاط الأخير",
  outstanding:"المستحقات",burnRate:"معدل الإنفاق",upcomingDue:"مستحق خلال 7 أيام",
  appearance:"المظهر",theme:"السمة",accent:"اللون الرئيسي",
  language:"اللغة",companySettings:"إعدادات الشركة",
  companyName:"اسم الشركة",taxNumber:"الرقم الضريبي",
  yearsService:"سنوات الخدمة",gratuityEst:"تقدير المكافأة",
  loanAmount:"مبلغ القرض",monthlyDeduction:"الخصم الشهري",
  advanceAmount:"مبلغ السلفة",overtimeHours:"ساعات إضافية",
  insurancePolicy:"وثيقة التأمين",insuranceExpiry:"تاريخ انتهاء التأمين",
  leaveEntitlement:"الاستحقاق السنوي (أيام)",leaveTaken:"الأيام المأخوذة",
  leaveRemaining:"الأيام المتبقية",leaveAccrued:"الأيام المستحقة",
  clientStatement:"كشف حساب العميل",creditLimit:"حد الائتمان",
  pipeline:"خط المبيعات",dealValue:"قيمة الصفقة",probability:"احتمالية %",
  activity:"النشاط",followUp:"متابعة",
  reconcile:"مطابقة",bankStatement:"كشف بنكي",clientProfile:"ملف العميل",supplierProfile:"ملف المورد",globalSearch:"البحث العام",notes:"ملاحظات",documents:"المستندات",transactions:"المعاملات",addNote:"إضافة ملاحظة",noNotes:"لا توجد ملاحظات",searchPlaceholder:"ابحث في الفواتير، العملاء، الموردين، الموظفين...",searchResults:"نتائج البحث",noResults:"لا توجد نتائج",
  costCenter:"مركز التكلفة",project:"المشروع",
  workSchedule:"جدول العمل",shift:"الوردية",
},
};

// ─── SEED DATA ───────────────────────────────────────────────
const SEED={
companies:[
  {id:1,name:"Apex Trading LLC",currency:"AED",logo:"AT",tax:5,color:"#3B82F6",type:"Trading",address:"123 Business Bay, Dubai, UAE",taxNum:"TRN-100387987300003",phone:"+971 4 123 4567",email:"info@apex.ae",website:"www.apex.ae",archived:false,fiscalYearStart:"01",workingDays:["Mon","Tue","Wed","Thu","Fri"],dailyWorkHours:9,leaveEntitlement:30},
  {id:2,name:"Global Retail Co.",currency:"USD",logo:"GR",tax:15,color:"#10B981",type:"Retail",address:"45 Commerce St, New York, USA",taxNum:"EIN-98-7654321",phone:"+1 212 555 0100",email:"info@globalretail.com",website:"www.globalretail.com",archived:false,fiscalYearStart:"01",workingDays:["Mon","Tue","Wed","Thu","Fri"],dailyWorkHours:8,leaveEntitlement:21},
],
revs:[
  {id:"r1",cId:1,amount:95000,cat:"Sales",description:"Q1 Product Sales Bundle - Apex Corp",date:"2026-02-20",payMethod:"Bank Transfer",customer:"Apex Corp",customerId:"cl1",ref:"REV-001",notes:"",costCenter:"Sales"},
  {id:"r2",cId:1,amount:32000,cat:"Consulting",description:"ERP Implementation - Phase 1",date:"2026-02-18",payMethod:"Wire Transfer",customer:"TechVentures LLC",customerId:"cl2",ref:"REV-002",notes:"",costCenter:"IT"},
  {id:"r3",cId:1,amount:18500,cat:"SaaS",description:"Monthly Subscriptions - Feb 2026",date:"2026-02-15",payMethod:"Credit Card",customer:"Multiple Clients",customerId:"",ref:"REV-003",notes:"",costCenter:"Sales"},
  {id:"r4",cId:1,amount:45000,cat:"Services",description:"Annual Support Contract Renewal",date:"2026-01-30",payMethod:"Bank Transfer",customer:"Delta Industries",customerId:"cl3",ref:"REV-004",notes:"",costCenter:"Operations"},
  {id:"r5",cId:1,amount:28000,cat:"Sales",description:"Hardware Batch Q1",date:"2026-01-22",payMethod:"Bank Transfer",customer:"StartupHub",customerId:"cl4",ref:"REV-005",notes:"",costCenter:"Sales"},
  {id:"r6",cId:2,amount:75000,cat:"Sales",description:"Q1 Retail Sales",date:"2026-02-19",payMethod:"Bank Transfer",customer:"Euromart",customerId:"",ref:"REV-006",notes:"",costCenter:"Sales"},
],
exps:[
  {id:"e1",cId:1,amount:68000,cat:"Salaries",description:"Staff Payroll — February 2026",date:"2026-02-28",payMethod:"Bank Transfer",vendor:"Internal",ref:"PAY-FEB-2026",notes:"",costCenter:"HR"},
  {id:"e2",cId:1,amount:22000,cat:"Rent",description:"Office Rent — Feb 2026 (Business Bay)",date:"2026-02-01",payMethod:"Bank Transfer",vendor:"Al Baraka Properties",ref:"RENT-FEB-2026",notes:"",costCenter:"Admin"},
  {id:"e3",cId:1,amount:8500,cat:"Software",description:"Cloud Services — AWS, Azure, Subscriptions",date:"2026-02-10",payMethod:"Credit Card",vendor:"Various",ref:"IT-FEB-2026",notes:"",costCenter:"IT"},
  {id:"e4",cId:1,amount:12000,cat:"Marketing",description:"Q1 Digital Marketing Campaign",date:"2026-02-12",payMethod:"Credit Card",vendor:"Digital Agency",ref:"MKT-001",notes:"",costCenter:"Marketing"},
  {id:"e5",cId:1,amount:4800,cat:"Utilities",description:"Electricity & Water — Feb 2026",date:"2026-02-28",payMethod:"Bank Transfer",vendor:"DEWA",ref:"UTIL-FEB-2026",notes:"",costCenter:"Admin"},
  {id:"e6",cId:2,amount:48000,cat:"Salaries",description:"Staff Payroll — February 2026",date:"2026-02-28",payMethod:"Bank Transfer",vendor:"Internal",ref:"PAY-FEB-2026",notes:"",costCenter:"HR"},
],
clients:[
  {id:"cl1",cId:1,name:"Mohammed Al-Rashidi",company:"Apex Corporation",phone:"+971 50 123 4567",email:"m.rashidi@apex.com",address:"Business Bay, Dubai, UAE",currency:"AED",creditLimit:500000,tags:["VIP","Enterprise"],notes:"Strategic partner since 2022",photo:"",nationality:"UAE",website:"www.apex.com",contactPerson:"Mohammed Al-Rashidi",position:"CFO"},
  {id:"cl2",cId:1,name:"Sarah Johnson",company:"TechVentures LLC",phone:"+1 212 555 0100",email:"sarah@techventures.com",address:"New York, USA",currency:"USD",creditLimit:150000,tags:["Tech","Premium"],notes:"ERP implementation client",photo:"",nationality:"USA",website:"www.techventures.com",contactPerson:"Sarah Johnson",position:"CEO"},
  {id:"cl3",cId:1,name:"Khalid Hassan",company:"Delta Industries",phone:"+971 55 987 6543",email:"k.hassan@delta.ae",address:"Sharjah Industrial Area, UAE",currency:"AED",creditLimit:200000,tags:["Industrial"],notes:"Annual support contract",photo:"",nationality:"UAE",website:"",contactPerson:"Khalid Hassan",position:"Operations Director"},
  {id:"cl4",cId:1,name:"Priya Sharma",company:"StartupHub Inc",phone:"+44 20 7946 0958",email:"priya@startuphub.io",address:"London, UK",currency:"GBP",creditLimit:75000,tags:["Startup","SaaS"],notes:"Monthly subscription",photo:"",nationality:"India",website:"www.startuphub.io",contactPerson:"Priya Sharma",position:"Founder"},
],
invoices:[
  {id:"inv1",cId:1,num:"INV-2026-001",clientId:"cl1",clientName:"Apex Corporation",clientEmail:"m.rashidi@apex.com",clientAddress:"Business Bay, Dubai, UAE",date:"2026-02-01",dueDate:"2026-03-03",status:"Paid",payTerms:"Net 30",currency:"AED",lines:[{id:"l1",desc:"Enterprise License x20 users",qty:20,price:4200,tax:5,discount:0},{id:"l2",desc:"Implementation Services (80h)",qty:80,price:350,tax:5,discount:10}],notes:"Thank you for your continued partnership!",paid:110600,paidDate:"2026-02-28",payMethod:"Bank Transfer",payRef:"AED-TRF-001"},
  {id:"inv2",cId:1,num:"INV-2026-002",clientId:"cl2",clientName:"TechVentures LLC",clientEmail:"sarah@techventures.com",clientAddress:"New York, USA",date:"2026-02-10",dueDate:"2026-03-12",status:"Sent",payTerms:"Net 30",currency:"USD",lines:[{id:"l3",desc:"Consulting - ERP Setup (Phase 1)",qty:60,price:280,tax:0,discount:0},{id:"l4",desc:"Training Workshops x8",qty:8,price:500,tax:0,discount:0}],notes:"Payment within 30 days as agreed.",paid:0,paidDate:"",payMethod:"",payRef:""},
  {id:"inv3",cId:1,num:"INV-2026-003",clientId:"cl4",clientName:"StartupHub Inc",clientEmail:"priya@startuphub.io",clientAddress:"London, UK",date:"2026-01-15",dueDate:"2026-02-14",status:"Overdue",payTerms:"Net 30",currency:"GBP",lines:[{id:"l5",desc:"SaaS Subscription - 50 users/mo",qty:50,price:45,tax:0,discount:0}],notes:"Monthly subscription - Jan 2026",paid:0,paidDate:"",payMethod:"",payRef:""},
],
quotes:[
  {id:"q1",cId:1,num:"QUO-2026-001",clientId:"cl3",clientName:"Delta Industries",clientEmail:"k.hassan@delta.ae",clientAddress:"Sharjah, UAE",date:"2026-02-20",validUntil:"2026-03-20",status:"Sent",currency:"AED",lines:[{id:"ql1",desc:"Annual Maintenance Contract",qty:1,price:85000,tax:5,discount:5},{id:"ql2",desc:"On-site Support visits x12",qty:12,price:3500,tax:5,discount:0}],notes:"Valid for 30 days. Prices subject to change after expiry.",convertedToInvoice:false},
],
workers:[
  {id:"w1",cId:1,name:"Ahmed Al-Rashid",role:"Operations Manager",dept:"Operations",salary:18000,startDate:"2022-03-15",status:"Active",email:"ahmed@apex.ae",phone:"+971 50 111 2222",nationality:"UAE",idNum:"784-1985-1234567-1",passportNum:"A12345678",insurancePolicy:"AXA-001-2026",insuranceExpiry:"2026-12-31",leaveEntitlement:30,photo:"",notes:"Senior management",emergencyContact:"Fatima Al-Rashid +971 50 999 8888",gender:"Male",dob:"1985-05-15"},
  {id:"w2",cId:1,name:"Sara Mohamed",role:"Senior Accountant",dept:"Finance",salary:14000,startDate:"2022-08-01",status:"Active",email:"sara@apex.ae",phone:"+971 55 333 4444",nationality:"Egypt",idNum:"784-1990-7654321-2",passportNum:"B98765432",insurancePolicy:"AXA-002-2026",insuranceExpiry:"2026-12-31",leaveEntitlement:30,photo:"",notes:"CPA certified",emergencyContact:"Ali Mohamed +20 100 123 4567",gender:"Female",dob:"1990-11-22"},
  {id:"w3",cId:1,name:"Khalid Hassan",role:"Warehouse Supervisor",dept:"Logistics",salary:9500,startDate:"2021-06-10",status:"Active",email:"khalid@apex.ae",phone:"+971 52 555 6666",nationality:"Jordan",idNum:"784-1988-1111111-3",passportNum:"C11111111",insurancePolicy:"AXA-003-2026",insuranceExpiry:"2026-12-31",leaveEntitlement:30,photo:"",notes:"",emergencyContact:"Mariam Hassan +962 79 123 4567",gender:"Male",dob:"1988-03-08"},
  {id:"w4",cId:1,name:"Fatima Ali",role:"Sales Executive",dept:"Sales",salary:8000,startDate:"2024-02-01",status:"Active",email:"fatima@apex.ae",phone:"+971 56 777 8888",nationality:"UAE",idNum:"784-1995-2222222-4",passportNum:"D22222222",insurancePolicy:"AXA-004-2026",insuranceExpiry:"2026-12-31",leaveEntitlement:30,photo:"",notes:"Top performer Q1",emergencyContact:"Ali Al-Rashidi +971 50 777 9999",gender:"Female",dob:"1995-07-19"},
  {id:"w5",cId:1,name:"Raj Patel",role:"IT Specialist",dept:"IT",salary:11000,startDate:"2023-11-15",status:"Active",email:"raj@apex.ae",phone:"+971 54 888 9999",nationality:"India",idNum:"784-1992-3333333-5",passportNum:"E33333333",insurancePolicy:"AXA-005-2026",insuranceExpiry:"2026-12-31",leaveEntitlement:30,photo:"",notes:"AWS certified",emergencyContact:"Anita Patel +91 98765 43210",gender:"Male",dob:"1992-09-30"},
],
loans:[
  {id:"ln1",cId:1,wId:"w1",amount:50000,monthlyDeduction:5000,startDate:"2026-01-01",reason:"Personal - Home renovation",status:"Active",approvedBy:"Management",approvedDate:"2025-12-15",notes:""},
  {id:"ln2",cId:1,wId:"w3",amount:20000,monthlyDeduction:2000,startDate:"2025-10-01",reason:"Medical emergency",status:"Active",approvedBy:"HR Manager",approvedDate:"2025-09-28",notes:"3 payments made"},
],
advances:[
  {id:"adv1",cId:1,wId:"w2",amount:5000,date:"2026-02-10",deductMonth:"2026-03",reason:"Travel expenses",status:"Pending",approvedBy:"",notes:""},
  {id:"adv2",cId:1,wId:"w4",amount:3000,date:"2026-01-20",deductMonth:"2026-02",reason:"Emergency",status:"Deducted",approvedBy:"Sara Mohamed",notes:"Deducted from Feb payroll"},
],
absences:[
  {id:"ab1",cId:1,wId:"w1",date:"2026-02-10",type:"Sick",paid:true,approved:true,notes:"Medical certificate submitted",hours:9},
  {id:"ab2",cId:1,wId:"w2",date:"2026-02-15",type:"Unpaid",paid:false,approved:true,notes:"Personal",hours:9},
  {id:"ab3",cId:1,wId:"w3",date:"2026-02-20",type:"Half Day",paid:true,approved:true,notes:"Doctor appointment",hours:4.5},
  {id:"ab4",cId:1,wId:"w4",date:"2026-02-05",type:"Annual Leave",paid:true,approved:true,notes:"Vacation",hours:9},
],
leaveRequests:[
  {id:"lr1",cId:1,wId:"w1",type:"Annual Leave",startDate:"2026-03-15",endDate:"2026-03-20",days:5,status:"Approved",approvedBy:"Management",requestDate:"2026-03-01",notes:"Family trip"},
  {id:"lr2",cId:1,wId:"w3",type:"Sick Leave",startDate:"2026-02-25",endDate:"2026-02-26",days:2,status:"Pending",approvedBy:"",requestDate:"2026-02-24",notes:"Flu"},
],
overtime:[
  {id:"ot1",cId:1,wId:"w1",date:"2026-02-14",hours:3,type:"Regular (1.25x)",reason:"Project deadline",approved:true,amount:0},
  {id:"ot2",cId:1,wId:"w2",date:"2026-02-22",hours:5,type:"Weekend (1.5x)",reason:"Month-end closing",approved:true,amount:0},
],
salaries:[
  {id:"sal1",cId:1,wId:"w1",month:"2026-01",base:18000,loanDeduction:5000,advanceDeduction:0,absenceDeduction:0,overtimeAdd:0,commissionAdd:0,otherAdd:0,otherDeduct:0,net:13000,paid:true,paidDate:"2026-01-31",payMethod:"Bank Transfer",notes:""},
  {id:"sal2",cId:1,wId:"w2",month:"2026-01",base:14000,loanDeduction:0,advanceDeduction:0,absenceDeduction:538,overtimeAdd:0,commissionAdd:0,otherAdd:0,otherDeduct:0,net:13462,paid:true,paidDate:"2026-01-31",payMethod:"Bank Transfer",notes:"1 unpaid absence"},
],
vaultAccounts:[
  {id:"va1",cId:1,name:"Main Cash Box",bank:"Internal",number:"",type:"Petty Cash",balance:45000,currency:"AED",notes:"Daily operations petty cash"},
  {id:"va2",cId:1,name:"Emirates NBD Business",bank:"Emirates NBD",number:"AE070331234567890123456",type:"Corporate",balance:892500,currency:"AED",notes:"Primary business account"},
  {id:"va3",cId:1,name:"HSBC USD Account",bank:"HSBC",number:"AE240200000001234567890",type:"Current",balance:125000,currency:"USD",notes:"International transfers"},
  {id:"va4",cId:2,name:"Chase Business",bank:"Chase Bank",number:"US-CHK-987654321",type:"Corporate",balance:320000,currency:"USD",notes:"Main account"},
],
vaultTxs:[
  {id:"vt1",cId:1,accId:"va2",type:"in",amount:110600,desc:"INV-2026-001 — Apex Corporation",date:"2026-02-28",cat:"Revenue",ref:"AED-TRF-001"},
  {id:"vt2",cId:1,accId:"va2",type:"out",amount:68000,desc:"Payroll February 2026",date:"2026-02-28",cat:"Salaries",ref:"PAY-FEB-2026"},
  {id:"vt3",cId:1,accId:"va2",type:"out",amount:22000,desc:"Office Rent February",date:"2026-02-01",cat:"Rent",ref:"RENT-FEB"},
  {id:"vt4",cId:1,accId:"va1",type:"in",amount:5000,desc:"Cash replenishment",date:"2026-02-15",cat:"Transfer",ref:"TRF-001"},
],
suppliers:[
  {id:"sp1",cId:1,name:"TechSupply FZCO",contact:"John Doe",email:"j.doe@techsupply.ae",phone:"+971 4 567 8901",cat:"Electronics",terms:30,currency:"USD",address:"JAFZA, Dubai, UAE",taxNum:"TRN-200387987300001",notes:"Preferred electronics supplier",rating:5,bankDetails:"IBAN: AE070331234567890123457"},
  {id:"sp2",cId:1,name:"OfficeWorld UAE",contact:"Mary Smith",email:"m.smith@officeworld.ae",phone:"+971 4 234 5678",cat:"Office Supplies",terms:14,currency:"AED",address:"Business Bay, Dubai",taxNum:"",notes:"",rating:4,bankDetails:""},
  {id:"sp3",cId:1,name:"FastLogistics LLC",contact:"Raju Kumar",email:"r.kumar@fastlog.ae",phone:"+971 50 123 9876",cat:"Transport",terms:7,currency:"AED",address:"Al Quoz, Dubai",taxNum:"",notes:"Reliable for urgent deliveries",rating:5,bankDetails:""},
],
purchaseOrders:[
  {id:"po1",cId:1,num:"PO-2026-001",supId:"sp1",date:"2026-02-10",delivDate:"2026-03-01",status:"Received",currency:"USD",lines:[{name:"Laptops Dell XPS 15",qty:5,unit:"unit",price:1800,tax:5},{name:"27-inch Monitors",qty:8,unit:"unit",price:420,tax:5}],notes:"Urgent - for new staff",received:true,receivedDate:"2026-02-28"},
  {id:"po2",cId:1,num:"PO-2026-002",supId:"sp2",date:"2026-02-20",delivDate:"2026-02-27",status:"Partial",currency:"AED",lines:[{name:"Ergonomic Office Chairs",qty:15,unit:"unit",price:1200,tax:5}],notes:"10 delivered, 5 pending",received:false,receivedDate:""},
],
products:[
  {id:"pr1",cId:1,name:"Enterprise License",sku:"EL-001",cat:"Software",costPrice:200,salePrice:4200,stock:9999,reorder:0,unit:"license",notes:"Per user/year",barcode:""},
  {id:"pr2",cId:1,name:"Consulting Hour",sku:"SVC-001",cat:"Services",costPrice:150,salePrice:350,stock:9999,reorder:0,unit:"hour",notes:"Professional services",barcode:""},
  {id:"pr3",cId:1,name:"Training Workshop",sku:"TRN-001",cat:"Services",costPrice:200,salePrice:600,stock:9999,reorder:0,unit:"session",notes:"Full day 8h workshop",barcode:""},
  {id:"pr4",cId:1,name:"Dell XPS 15 Laptop",sku:"HW-001",cat:"Hardware",costPrice:1800,salePrice:2400,stock:12,reorder:5,unit:"unit",notes:"In stock",barcode:"HW-XPS15-001"},
],
crmLeads:[
  {id:"crm1",cId:1,name:"Ahmed Younis",company:"Future Tech LLC",email:"a.younis@futuretech.ae",phone:"+971 50 222 3333",stage:"Proposal",dealValue:120000,probability:65,assignedTo:"Fatima Ali",lastActivity:"2026-02-20",nextFollowUp:"2026-03-05",notes:"Interested in ERP + Support package",currency:"AED",source:"LinkedIn"},
  {id:"crm2",cId:1,name:"Lisa Chen",company:"Pacific Imports",email:"l.chen@pacific.com",phone:"+852 2345 6789",stage:"Negotiation",dealValue:85000,probability:80,assignedTo:"Ahmed Al-Rashid",lastActivity:"2026-02-22",nextFollowUp:"2026-03-01",notes:"Final pricing discussion",currency:"USD",source:"Referral"},
  {id:"crm3",cId:1,name:"Omar Farouq",company:"Gulf Traders",email:"o.farouq@gulftrad.ae",phone:"+971 55 444 5555",stage:"Qualified",dealValue:50000,probability:40,assignedTo:"Fatima Ali",lastActivity:"2026-02-15",nextFollowUp:"2026-03-10",notes:"Budget confirmation pending",currency:"AED",source:"Cold Call"},
],
utilities:[
  {id:"ut1",cId:1,month:"2026-02",prevReading:14250,currReading:15480,kwhRate:0.38,workerCost:8200,opCost:3500,notes:"Normal consumption"},
  {id:"ut2",cId:1,month:"2026-01",prevReading:13100,currReading:14250,kwhRate:0.38,workerCost:8200,opCost:3200,notes:"January - peak cooling"},
],
storageFacilities:[
  {id:"sf1",cId:1,name:"Cold Hub — Block A",type:"Refrigeration",capacity:500,address:"Industrial Area 3, Dubai",minTemp:-5,maxTemp:4,notes:"ISO 22000 certified",monthlyRate:180},
  {id:"sf2",cId:1,name:"Freezer Zone B",type:"Freezer",capacity:200,address:"Industrial Area 3, Dubai",minTemp:-25,maxTemp:-18,notes:"For frozen goods",monthlyRate:280},
],
storageUnits:[
  {id:"su1",cId:1,facId:"sf1",name:"Unit A-01",clientId:"cl1",clientName:"Apex Corporation",entryDate:"2026-01-15",exitDate:"2026-04-15",capacity:50,stored:42,priceDay:180,status:"occupied",temp:2.4,notes:"Fresh produce"},
  {id:"su2",cId:1,facId:"sf1",name:"Unit A-02",clientId:"",clientName:"",entryDate:"",exitDate:"",capacity:50,stored:0,priceDay:180,status:"available",temp:2.1,notes:""},
  {id:"su3",cId:1,facId:"sf2",name:"Unit B-01",clientId:"cl3",clientName:"Delta Industries",entryDate:"2026-02-01",exitDate:"2026-05-01",capacity:100,stored:75,priceDay:280,status:"occupied",temp:-22,notes:"Frozen seafood"},
],
budgets:[
  {id:"bg1",cId:1,year:2026,months:{
    "2026-01":{rev:180000,exp:120000},"2026-02":{rev:200000,exp:130000},"2026-03":{rev:220000,exp:135000},
    "2026-04":{rev:230000,exp:140000},"2026-05":{rev:240000,exp:145000},"2026-06":{rev:250000,exp:150000},
    "2026-07":{rev:260000,exp:155000},"2026-08":{rev:255000,exp:152000},"2026-09":{rev:265000,exp:158000},
    "2026-10":{rev:275000,exp:163000},"2026-11":{rev:285000,exp:168000},"2026-12":{rev:310000,exp:175000},
  }},
],
activities:[],
};

// Export for modules


// ═══════════════════════════════════════════════════════════
//  MASHRO3Y v7.0 — SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════════════

// ─── CONTEXT ────────────────────────────────────────────────
const Ctx=React.createContext({});
const useApp=()=>React.useContext(Ctx);

// ─── FORM CONTEXT (keyboard focus fix) ──────────────────────
const FormCtx = React.createContext(null);
const F = React.memo(function FormField({fk, ...props}){
  const ctx = React.useContext(FormCtx);
  if(!ctx) return null;
  return <Field {...props} value={ctx.form[fk]??""} onChange={v=>ctx.sf(fk,v)}/>;
});
const FG = ({cols=2,children}) => (
  <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:12,marginBottom:14}}>
    {children}
  </div>
);

// ─── TOAST ───────────────────────────────────────────────────
function Toast({toasts}){
  const {t}=useApp();
  const {rtl:rtlToast}=useApp();
  if(!toasts?.length)return null;
  return React.createElement("div",{className:"toast-container",style:{position:"fixed",top:16,right:rtlToast?undefined:16,left:rtlToast?16:undefined,zIndex:9999,display:"flex",flexDirection:"column",gap:8,pointerEvents:"none",maxWidth:320}},
    toasts.map(t2=>React.createElement("div",{key:t2.id,style:{
      padding:"12px 18px",borderRadius:12,fontWeight:700,fontSize:13,
      background:t2.type==="error"?"#EF4444":t2.type==="warning"?"#F59E0B":"#10B981",
      color:"#fff",boxShadow:"0 6px 24px rgba(0,0,0,.4)",
      animation:"toastSlide 0.3s ease",display:"flex",alignItems:"center",gap:10,
    }},React.createElement("span",null,t2.type==="error"?"✕":t2.type==="warning"?"⚠":"✓"),
    React.createElement("span",null,t2.msg))
  ));
}

// ─── MODAL ───────────────────────────────────────────────────
function Modal({title,children,onClose,width=520,footer,noPad=false}){
  const {t}=useApp();
  React.useEffect(()=>{
    const h=e=>{if(e.key==="Escape")onClose();};
    document.addEventListener("keydown",h);
    document.body.style.overflow="hidden";
    return()=>{document.removeEventListener("keydown",h);document.body.style.overflow="";};
  },[onClose]);
  return(
    <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(4px)"}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:t.bg2,borderRadius:20,width:"100%",maxWidth:width,maxHeight:"92vh",display:"flex",flexDirection:"column",boxShadow:t.sh2,animation:"modalPop .22s cubic-bezier(.34,1.56,.64,1)",border:`1px solid ${t.bd}`}}>
        <div style={{padding:"18px 22px 14px",borderBottom:`1px solid ${t.bd}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{fontSize:16,fontWeight:800,color:t.tx}}>{title}</div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:8,border:"none",background:t.bg3,color:t.tx3,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>×</button>
        </div>
        <div style={{padding:noPad?0:22,overflowY:"auto",flex:1}}>{children}</div>
        {footer&&<div style={{padding:"14px 22px",borderTop:`1px solid ${t.bd}`,display:"flex",gap:10,justifyContent:"flex-end",flexShrink:0,background:t.bg3,borderRadius:"0 0 20px 20px"}}>{footer}</div>}
      </div>
    </div>
  );
}

// ─── FIELD ──────────────────────────────────────────────────
const Field=React.memo(({label,value,onChange,type="text",options=[],placeholder="",required=false,hint="",rows=3,min,max,step,readOnly=false,prefix,suffix,fk})=>{
  const {t}=useApp();
  const base={width:"100%",padding:prefix||suffix?"9px 12px":"9px 12px",borderRadius:10,border:`1.5px solid ${t.bd}`,background:readOnly?t.bg3:t.bg,color:t.tx,fontSize:13,outline:"none",transition:"border .15s",fontFamily:"inherit",WebkitAppearance:"none"};
  const onFocus=e=>{if(!readOnly)e.target.style.borderColor=t.a;};
  const onBlur=e=>{e.target.style.borderColor=t.bd;};
  let input;
  if(type==="select"){
    input=<select value={value??""} onChange={e=>onChange(e.target.value)} style={base} onFocus={onFocus} onBlur={onBlur} disabled={readOnly}>
      <option value="">— Select —</option>
      {options.map((o,i)=>{const v=typeof o==="object"?o.value:o;const l=typeof o==="object"?o.label:o;return<option key={`opt-${v}`} value={v}>{l}</option>;})}
    </select>;
  } else if(type==="textarea"){
    input=<textarea value={value??""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} readOnly={readOnly} style={{...base,resize:"vertical"}} onFocus={onFocus} onBlur={onBlur}/>;
  } else if(type==="checkbox"){
    return(
      <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"6px 0"}}>
        <input type="checkbox" checked={!!value} onChange={e=>onChange(e.target.checked)} style={{width:18,height:18,accentColor:t.a,cursor:"pointer"}}/>
        <span style={{fontSize:13,color:t.tx2,fontWeight:500}}>{label}</span>
        {hint&&<span style={{fontSize:11,color:t.tx4}}>({hint})</span>}
      </label>
    );
  } else {
    input=<input type={type} value={value??""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} min={min} max={max} step={step} readOnly={readOnly} inputMode={type==="number"?"decimal":undefined} style={base} onFocus={onFocus} onBlur={onBlur}/>;
  }
  
  if(prefix||suffix){
    input=<div style={{position:"relative",display:"flex",alignItems:"center"}}>
      {prefix&&<span style={{position:"absolute",left:12,color:t.tx4,fontSize:13,pointerEvents:"none",fontWeight:600}}>{prefix}</span>}
      <div style={{flex:1}}>
        {React.cloneElement(input,{style:{...base,paddingLeft:prefix?36:12,paddingRight:suffix?36:12}})}
      </div>
      {suffix&&<span style={{position:"absolute",right:12,color:t.tx4,fontSize:12,pointerEvents:"none"}}>{suffix}</span>}
    </div>;
  }
  
  return(
    <div style={{marginBottom:14}}>
      {label&&<label style={{display:"block",fontSize:11,fontWeight:700,color:t.tx3,marginBottom:6,letterSpacing:.3,textTransform:"uppercase"}}>
        {label}{required&&<span style={{color:"#EF4444",marginLeft:3}}>*</span>}
      </label>}
      {input}
      {hint&&<div style={{fontSize:11,color:t.tx4,marginTop:5}}>{hint}</div>}
    </div>
  );
});

// ─── BTN ─────────────────────────────────────────────────────
function Btn({children,onClick,variant="primary",size="md",icon,disabled=false,style:cs={},title}){
  const {t}=useApp();
  const v={
    primary:{background:t.a,color:"#fff",border:"none",boxShadow:`0 2px 12px ${t.a}40`},
    secondary:{background:t.bg3,color:t.tx2,border:`1.5px solid ${t.bd}`},
    danger:{background:"#EF4444",color:"#fff",border:"none",boxShadow:"0 2px 8px #EF444440"},
    ghost:{background:"transparent",color:t.tx3,border:`1.5px solid ${t.bd}`},
    success:{background:"#10B981",color:"#fff",border:"none",boxShadow:"0 2px 8px #10B98140"},
    warning:{background:"#F59E0B",color:"#fff",border:"none"},
    link:{background:"transparent",color:t.a,border:"none",padding:"0"},
  };
  const s={sm:{padding:"5px 12px",fontSize:11,borderRadius:8,gap:5},md:{padding:"9px 18px",fontSize:13,borderRadius:10,gap:7},lg:{padding:"12px 24px",fontSize:14,borderRadius:12,gap:8}};
  const vs=v[variant]||v.primary;const ss=s[size]||s.md;
  return(
    <button onClick={onClick} disabled={disabled} title={title} style={{...vs,...ss,fontWeight:700,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.5:1,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:ss.gap,whiteSpace:"nowrap",transition:"all .15s",fontFamily:"inherit",...cs}}
      onMouseEnter={e=>{if(!disabled&&variant!=="link"){e.currentTarget.style.filter="brightness(1.1)";e.currentTarget.style.transform="translateY(-1px)";}}}
      onMouseLeave={e=>{e.currentTarget.style.filter="";e.currentTarget.style.transform="";}}
      onMouseDown={e=>{if(!disabled)e.currentTarget.style.transform="scale(0.97)";}}
      onMouseUp={e=>{e.currentTarget.style.transform="";}}
    >
      {icon&&<span style={{fontSize:size==="sm"?12:14,lineHeight:1}}>{icon}</span>}
      {children}
    </button>
  );
}

// ─── BADGE ───────────────────────────────────────────────────
function Badge({status,size="sm"}){
  const colors={
    paid:"#10B981",active:"#10B981",received:"#10B981",won:"#10B981",approved:"#10B981",
    pending:"#F59E0B","on leave":"#F59E0B",partial:"#F59E0B",sent:"#3B82F6",confirmed:"#3B82F6",qualified:"#3B82F6",
    overdue:"#EF4444",cancelled:"#EF4444",suspended:"#EF4444",terminated:"#6B7280",lost:"#EF4444",rejected:"#EF4444",
    draft:"#94A3B8",inactive:"#94A3B8",available:"#10B981",occupied:"#F59E0B",
    proposal:"#8B5CF6",negotiation:"#F97316",lead:"#64748B",
    "sick":"#EF4444","absent":"#EF4444","unpaid":"#EF4444",
    "annual leave":"#3B82F6","half day":"#F59E0B",
    "paid off":"#10B981","written off":"#94A3B8",
  };
  const s=String(status||"").toLowerCase();
  const c=colors[s]||"#64748B";
  const pads={sm:"3px 9px",md:"5px 13px",lg:"6px 16px"};
  const fss={sm:10,md:12,lg:13};
  return(
    <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:pads[size]||pads.sm,borderRadius:20,fontSize:fss[size]||fss.sm,fontWeight:700,background:`${c}20`,color:c,whiteSpace:"nowrap",border:`1px solid ${c}30`}}>
      <span style={{width:5,height:5,borderRadius:"50%",background:c,flexShrink:0}}/>
      {status}
    </span>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────
function StatCard({label,value,sub,icon,color,trend,onClick,accent=false}){
  const {t}=useApp();
  return(
    <div onClick={onClick} style={{background:accent?`linear-gradient(135deg,${color||t.a}15,${color||t.a}05)`:t.bg2,borderRadius:16,padding:"18px 20px",boxShadow:t.sh,borderLeft:`4px solid ${color||t.a}`,cursor:onClick?"pointer":"default",transition:"transform .15s,box-shadow .15s",border:`1px solid ${t.bd}`,borderLeft:`4px solid ${color||t.a}`}}
      onMouseEnter={e=>{if(onClick){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=t.sh2;}}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=t.sh;}}
    >
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div style={{fontSize:11,fontWeight:700,color:t.tx4,letterSpacing:.5,textTransform:"uppercase"}}>{label}</div>
        {icon&&<div style={{width:36,height:36,borderRadius:10,background:`${color||t.a}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{icon}</div>}
      </div>
      <div style={{fontSize:24,fontWeight:900,color:t.tx,marginBottom:6,letterSpacing:-.5}}>{value}</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        {sub&&<div style={{fontSize:11,color:t.tx4}}>{sub}</div>}
        {trend!==undefined&&<div style={{fontSize:11,fontWeight:700,color:trend>=0?"#10B981":"#EF4444",display:"flex",alignItems:"center",gap:3}}>
          <span>{trend>=0?"↑":"↓"}</span><span>{Math.abs(trend)}%</span>
        </div>}
      </div>
    </div>
  );
}

// ─── SKELETON ────────────────────────────────────────────────
function Skeleton({width="100%",height=16,radius=8,style={}}){
  const {t}=useApp();
  return(
    <div style={{width,height,borderRadius:radius,
      backgroundImage:`linear-gradient(90deg,${t.bg4} 0%,${t.bg5} 50%,${t.bg4} 100%)`,
      backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite ease-in-out",...style}}/>
  );
}
function SkeletonCard(){
  const {t}=useApp();
  return(
    <div style={{background:t.bg2,borderRadius:16,border:`1px solid ${t.bd}`,padding:20,boxShadow:t.sh}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
        <Skeleton height={12} width="55%" radius={6}/>
        <Skeleton height={28} width={28} radius={8}/>
      </div>
      <Skeleton height={30} radius={8} style={{marginBottom:8}}/>
      <Skeleton height={11} width="45%" radius={6}/>
    </div>
  );
}
function PageSkeleton({cards=6}){
  return(
    <div style={{padding:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <Skeleton width={32} height={32} radius={10}/>
          <Skeleton width={200} height={26} radius={8}/>
        </div>
        <Skeleton width={130} height={38} radius={10}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:20}}>
        {Array.from({length:4}).map((_,i)=><SkeletonCard key={i}/>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {Array.from({length:cards}).map((_,i)=><SkeletonCard key={i}/>)}
      </div>
    </div>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────
function EmptyState({icon="📭",title="Nothing here yet",subtitle,action}){
  const {t}=useApp();
  return(
    <div style={{textAlign:"center",padding:"60px 24px"}}>
      <div style={{fontSize:52,marginBottom:14,opacity:.85,lineHeight:1}}>{icon}</div>
      <div style={{fontSize:16,fontWeight:800,color:t.tx3,marginBottom:6}}>{title}</div>
      {subtitle&&<p style={{fontSize:13,color:t.tx4,marginBottom:16,maxWidth:320,margin:"0 auto 16px"}}>{subtitle}</p>}
      {action&&<div style={{marginTop:16,display:"flex",justifyContent:"center"}}>{action}</div>}
    </div>
  );
}


// ─── TABLE ───────────────────────────────────────────────────
function Table({cols,rows,onRowClick,emptyMsg,actions,stickyHeader=true}){
  const {t,tr}=useApp();
  return(
    <div style={{overflowX:"auto",width:"100%"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:cols.length*100}}>
        <thead>
          <tr style={{borderBottom:`2px solid ${t.bd}`,background:t.bg3,position:stickyHeader?"sticky":undefined,top:0,zIndex:1}}>
            {cols.map((c,i)=><th key={i} style={{padding:"11px 14px",textAlign:c.right?"right":c.center?"center":"left",color:t.tx4,fontWeight:700,fontSize:11,whiteSpace:"nowrap",letterSpacing:.3,textTransform:"uppercase"}}>{c.label}</th>)}
            {actions&&<th style={{padding:"11px 14px",width:1}}/>}
          </tr>
        </thead>
        <tbody>
          {rows.length===0&&(
            <tr><td colSpan={cols.length+(actions?1:0)}>
              <EmptyState icon="📭" title={emptyMsg||tr?.noData||"No data yet"}/>
            </td></tr>
          )}
          {rows.map((row,ri)=>(
            <tr key={row.id||ri} onClick={()=>onRowClick&&onRowClick(row)}
              style={{borderBottom:`1px solid ${t.bd}`,cursor:onRowClick?"pointer":"default",transition:"background .1s"}}
              onMouseEnter={e=>{e.currentTarget.style.background=t.bg3;}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
              {cols.map((c,ci)=>(
                <td key={ci} style={{padding:"11px 14px",color:c.dim?t.tx4:t.tx,textAlign:c.right?"right":c.center?"center":"left",whiteSpace:c.wrap?"normal":"nowrap",verticalAlign:"middle"}}>
                  {c.render?c.render(row[c.key],row):row[c.key]??<span style={{color:t.tx5}}>—</span>}
                </td>
              ))}
              {actions&&<td style={{padding:"8px 14px",whiteSpace:"nowrap"}} onClick={e=>e.stopPropagation()}>{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── TABS ─────────────────────────────────────────────────────
function Tabs({tabs,active,onChange}){
  const {t}=useApp();
  return(
    <div style={{display:"flex",gap:0,borderBottom:`2px solid ${t.bd}`,marginBottom:20,overflowX:"auto"}}>
      {tabs.map(tab=>(
        <button key={tab.id} onClick={()=>onChange(tab.id)} style={{
          padding:"11px 18px",fontSize:13,fontWeight:600,border:"none",background:"transparent",
          color:active===tab.id?t.a:t.tx4,
          borderBottom:active===tab.id?`2px solid ${t.a}`:"2px solid transparent",
          marginBottom:-2,cursor:"pointer",transition:"all .15s",
          display:"flex",alignItems:"center",gap:8,whiteSpace:"nowrap",
        }}>
          {tab.icon&&<span style={{fontSize:14}}>{tab.icon}</span>}
          {tab.label}
          {tab.count!==undefined&&<span style={{
            background:active===tab.id?`${t.a}25`:t.bg3,
            color:active===tab.id?t.a:t.tx4,
            padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,
          }}>{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}

// ─── PAGE HEADER ─────────────────────────────────────────────
function PageHeader({title,subtitle,actions,icon,back,onBack}){
  const {t}=useApp();
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:12}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        {back&&onBack&&<button onClick={onBack} style={{width:36,height:36,borderRadius:10,border:`1.5px solid ${t.bd}`,background:t.bg2,color:t.tx3,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>←</button>}
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {icon&&<span style={{fontSize:24}}>{icon}</span>}
            <h1 style={{fontSize:22,fontWeight:900,color:t.tx,margin:0,letterSpacing:-.5}}>{title}</h1>
          </div>
          {subtitle&&<div style={{fontSize:12,color:t.tx4,marginTop:4}}>{subtitle}</div>}
        </div>
      </div>
      {actions&&<div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>{actions}</div>}
    </div>
  );
}

// ─── SEARCH BAR ──────────────────────────────────────────────
function SearchBar({value,onChange,placeholder,onFilter}){
  const {t,tr}=useApp();
  return(
    <div style={{display:"flex",gap:8,alignItems:"center"}}>
      <div style={{position:"relative"}}>
        <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:t.tx4,fontSize:15,pointerEvents:"none"}}>🔍</span>
        <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||((tr?.search||"Search")+"...")} style={{padding:"9px 14px 9px 36px",borderRadius:10,border:`1.5px solid ${t.bd}`,background:t.bg2,color:t.tx,fontSize:13,outline:"none",width:260,transition:"border .15s"}}
          onFocus={e=>e.target.style.borderColor=t.a} onBlur={e=>e.target.style.borderColor=t.bd}/>
      </div>
      {onFilter&&<button onClick={onFilter} style={{padding:"9px 14px",borderRadius:10,border:`1.5px solid ${t.bd}`,background:t.bg2,color:t.tx3,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:6}}>⚙ Filter</button>}
    </div>
  );
}

// ─── AVATAR ──────────────────────────────────────────────────
function Avatar({name,photo,size=40,color}){
  const {t}=useApp();
  const initials=(name||"?").split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
  const colors=["#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6","#F97316","#14B8A6","#6366F1"];
  const autoColor=colors[(name||"").charCodeAt(0)%colors.length];
  if(photo)return <img src={photo} alt={name} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover"}}/>;
  return(
    <div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${color||autoColor},${color||autoColor}99)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.35,fontWeight:800,color:"#fff",flexShrink:0,userSelect:"none",boxShadow:`0 2px 8px ${color||autoColor}40`}}>
      {initials}
    </div>
  );
}

// ─── PROGRESS BAR ────────────────────────────────────────────
function ProgressBar({value,max,color,height=6,showLabel=false}){
  const {t}=useApp();
  const pct=max>0?Math.min(100,Math.round((value/max)*100)):0;
  return(
    <div>
      <div style={{background:t.bg4,borderRadius:height,height,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,height:"100%",background:color||t.a,borderRadius:height,transition:"width .4s ease"}}/>
      </div>
      {showLabel&&<div style={{fontSize:11,color:t.tx4,marginTop:3,textAlign:"right"}}>{pct}%</div>}
    </div>
  );
}

// ─── CARD ────────────────────────────────────────────────────
function Card({children,style={},onClick,hover=true}){
  const {t}=useApp();
  return(
    <div onClick={onClick} style={{background:t.bg2,borderRadius:16,border:`1px solid ${t.bd}`,boxShadow:t.sh,cursor:onClick?"pointer":"default",transition:hover?"transform .15s,box-shadow .15s":undefined,...style}}
      onMouseEnter={e=>{if(onClick&&hover){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=t.sh2;}}}
      onMouseLeave={e=>{if(onClick&&hover){e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=t.sh;}}}>
      {children}
    </div>
  );
}

// ─── SECTION ─────────────────────────────────────────────────
function Section({title,children,actions,icon,collapsible=false}){
  const {t}=useApp();
  const [open,setOpen]=React.useState(true);
  return(
    <div style={{background:t.bg2,borderRadius:16,border:`1px solid ${t.bd}`,boxShadow:t.sh,overflow:"hidden",marginBottom:16}}>
      <div style={{padding:"16px 20px",borderBottom:open?`1px solid ${t.bd}`:"none",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:collapsible?"pointer":"default"}} onClick={collapsible?()=>setOpen(!open):undefined}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {icon&&<span style={{fontSize:16}}>{icon}</span>}
          <span style={{fontWeight:700,color:t.tx,fontSize:14}}>{title}</span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {actions}
          {collapsible&&<span style={{color:t.tx4,fontSize:12,transition:"transform .2s",transform:open?"rotate(0)":"rotate(-90deg)"}}>▾</span>}
        </div>
      </div>
      {open&&<div style={{padding:20}}>{children}</div>}
    </div>
  );
}

// ─── CONFIRM DIALOG ──────────────────────────────────────────
function ConfirmDialog({message,onConfirm,onCancel,danger=true}){
  const {t,tr}=useApp();
  return(
    <Modal title={danger?"⚠ Confirm Delete":"Confirm"} onClose={onCancel} width={380}>
      <p style={{color:t.tx2,marginBottom:20,lineHeight:1.6}}>{message}</p>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
        <Btn onClick={onCancel} variant="ghost">{tr?.cancel||"Cancel"}</Btn>
        <Btn onClick={onConfirm} variant={danger?"danger":"primary"}>{danger?"Delete":"Confirm"}</Btn>
      </div>
    </Modal>
  );
}

// ─── PROFILE HEADER ──────────────────────────────────────────
function ProfileHeader({name,sub,sub2,photo,color,actions,tags,badge}){
  const {t}=useApp();
  return(
    <div style={{padding:"24px 24px 20px",borderBottom:`1px solid ${t.bd}`,background:t.bg2}}>
      <div style={{display:"flex",gap:18,alignItems:"flex-start",flexWrap:"wrap"}}>
        <Avatar name={name} photo={photo} size={72} color={color}/>
        <div style={{flex:1,minWidth:200}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:6}}>
            <h2 style={{fontSize:22,fontWeight:900,color:t.tx,margin:0}}>{name}</h2>
            {badge&&<Badge status={badge}/>}
          </div>
          {sub&&<div style={{fontSize:14,color:t.tx3,marginBottom:2}}>{sub}</div>}
          {sub2&&<div style={{fontSize:12,color:t.tx4}}>{sub2}</div>}
          {tags&&tags.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
            {tags.map((tag,i)=><span key={i} style={{padding:"3px 10px",borderRadius:20,background:`${t.a}20`,color:t.a,fontSize:11,fontWeight:700}}>{tag}</span>)}
          </div>}
        </div>
        {actions&&<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{actions}</div>}
      </div>
    </div>
  );
}

// ─── INFO GRID ───────────────────────────────────────────────
function InfoGrid({items,cols=2}){
  const {t}=useApp();
  return(
    <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:"12px 24px"}}>
      {items.filter(Boolean).map((item,i)=>(
        <div key={i}>
          <div style={{fontSize:10,fontWeight:700,color:t.tx4,letterSpacing:.5,marginBottom:4,textTransform:"uppercase"}}>{item.label}</div>
          <div style={{fontSize:13,fontWeight:600,color:item.color||t.tx,display:"flex",alignItems:"center",gap:6}}>
            {item.icon&&<span>{item.icon}</span>}
            {item.value??<span style={{color:t.tx5}}>—</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ACTIVITY ITEM ───────────────────────────────────────────
function ActivityItem({icon,title,sub,amount,amountColor,time,onClick}){
  const {t}=useApp();
  return(
    <div onClick={onClick} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${t.bd}`,cursor:onClick?"pointer":"default"}}
      onMouseEnter={e=>{if(onClick)e.currentTarget.style.background=t.bg3;}}
      onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
      <div style={{width:36,height:36,borderRadius:10,background:t.bg3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{icon}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:600,color:t.tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{title}</div>
        {sub&&<div style={{fontSize:11,color:t.tx4}}>{sub}</div>}
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        {amount&&<div style={{fontSize:13,fontWeight:700,color:amountColor||t.tx}}>{amount}</div>}
        {time&&<div style={{fontSize:10,color:t.tx5}}>{time}</div>}
      </div>
    </div>
  );
}

// ─── LINE ITEMS EDITOR ───────────────────────────────────────
function LineItemsEditor({lines,onChange,products=[],showTax=true,showDiscount=true}){
  const {t,fmt}=useApp();
  const update=(i,k,v)=>{const l=[...lines];l[i]={...l[i],[k]:v};onChange(l);};
  const add=()=>onChange([...lines,{id:uid(),desc:"",qty:1,price:0,tax:0,discount:0,unit:""}]);
  const remove=i=>onChange(lines.filter((_,j)=>j!==i));
  const setProduct=(i,prodId,prods)=>{
    const p=prods.find(x=>x.id===prodId);
    if(p){const l=[...lines];l[i]={...l[i],desc:p.name,price:p.salePrice,unit:p.unit,_prodId:prodId};onChange(l);}
  };
  
  const totals=lines.reduce((acc,l)=>{const c=calcLine(l);return{sub:acc.sub+c.taxable,tax:acc.tax+c.tax,total:acc.total+c.total};},{sub:0,tax:0,total:0});
  
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:13,fontWeight:700,color:t.tx}}>Line Items</div>
        <Btn size="sm" variant="secondary" onClick={add} icon="＋">Add Line</Btn>
      </div>
      <div style={{border:`1.5px solid ${t.bd}`,borderRadius:12,overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{background:t.bg3}}>
                {["#","Description","Qty","Unit Price",showDiscount&&"Disc%",showTax&&"Tax%","Total",""].filter(Boolean).map((h,i)=>(
                  <th key={i} style={{padding:"9px 10px",textAlign:i>1?"right":"left",color:t.tx4,fontWeight:700,borderBottom:`1.5px solid ${t.bd}`,fontSize:11,letterSpacing:.3}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.map((line,i)=>{
                const c=calcLine(line);
                return(
                  <tr key={i} style={{borderBottom:`1px solid ${t.bd}`,background:i%2===0?"transparent":t.bg3+"40"}}>
                    <td style={{padding:"8px 10px",color:t.tx4,width:30}}>{i+1}</td>
                    <td style={{padding:"8px 10px",minWidth:180}}>
                      {products.length>0&&<select value={line._prodId||""} onChange={e=>setProduct(i,e.target.value,products)} style={{width:"100%",background:"transparent",border:"none",color:t.tx4,fontSize:11,marginBottom:2,outline:"none"}}>
                        <option value="">Pick product...</option>
                        {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>}
                      <input value={line.desc||""} onChange={e=>update(i,"desc",e.target.value)} placeholder="Item description" style={{width:"100%",background:"transparent",border:"none",color:t.tx,fontSize:12,fontWeight:500,outline:"none"}}/>
                    </td>
                    <td style={{padding:"6px 8px",width:60}}><input type="number" value={line.qty} onChange={e=>update(i,"qty",e.target.value)} min="0" style={{width:55,background:"transparent",border:"none",color:t.tx,fontSize:12,textAlign:"right",outline:"none"}}/></td>
                    <td style={{padding:"6px 8px",width:90}}><input type="number" value={line.price} onChange={e=>update(i,"price",e.target.value)} min="0" style={{width:80,background:"transparent",border:"none",color:t.tx,fontSize:12,textAlign:"right",outline:"none"}}/></td>
                    {showDiscount&&<td style={{padding:"6px 8px",width:65}}><input type="number" value={line.discount||0} onChange={e=>update(i,"discount",e.target.value)} min="0" max="100" style={{width:55,background:"transparent",border:"none",color:line.discount?"#F59E0B":t.tx3,fontSize:12,textAlign:"right",outline:"none"}}/></td>}
                    {showTax&&<td style={{padding:"6px 8px",width:65}}><input type="number" value={line.tax||0} onChange={e=>update(i,"tax",e.target.value)} min="0" max="100" style={{width:55,background:"transparent",border:"none",color:t.tx3,fontSize:12,textAlign:"right",outline:"none"}}/></td>}
                    <td style={{padding:"6px 10px",textAlign:"right",fontWeight:700,color:t.a,whiteSpace:"nowrap",width:90}}>{fmtNum(c.total,2)}</td>
                    <td style={{padding:"6px 8px",width:30}}><button onClick={()=>remove(i)} style={{width:22,height:22,borderRadius:6,background:"#EF444420",color:"#EF4444",border:"none",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {lines.length>0&&(
          <div style={{padding:"12px 16px",background:t.bg3,display:"flex",justifyContent:"flex-end",gap:24,fontSize:13,borderTop:`1px solid ${t.bd}`}}>
            <span style={{color:t.tx4}}>Subtotal: <b style={{color:t.tx}}>{fmtNum(totals.sub,2)}</b></span>
            {showTax&&<span style={{color:t.tx4}}>Tax: <b style={{color:t.tx}}>{fmtNum(totals.tax,2)}</b></span>}
            <span style={{fontWeight:800,color:t.a,fontSize:15}}>Total: {fmtNum(totals.total,2)}</span>
          </div>
        )}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
//  MASHRO3Y v8.3 — ONBOARDING WIZARD
// ═══════════════════════════════════════════════════════════
function OnboardingWizard({onComplete}){
  const {t:theme}=useApp();
  const t=theme;
  const [step,setStep]=React.useState(0);
  const [co,setCo]=React.useState({name:"",type:"Trading",currency:"AED",tax:"5",color:"#3B82F6",address:"",email:"",phone:""});
  const [prefs,setPrefs]=React.useState({dark:true,lang:"en",accent:"Blue"});
  const {setDark,setLang,setAccentName,setCompanies,setAcId}=useApp();

  const steps=["Welcome","Your Company","Preferences","You're Ready!"];
  const pct=Math.round((step/3)*100);

  const finish=()=>{
    if(co.name){
      const newCo={id:Date.now(),name:co.name,type:co.type||"Trading",currency:co.currency||"AED",logo:(co.name||"").slice(0,2).toUpperCase(),tax:+co.tax||5,color:co.color||"#3B82F6",address:co.address||"",email:co.email||"",phone:co.phone||"",website:"",taxNum:"",archived:false,fiscalYearStart:"01",workingDays:["Mon","Tue","Wed","Thu","Fri"],dailyWorkHours:9,leaveEntitlement:30};
      setCompanies(p=>[...p,newCo]);
      setAcId(newCo.id);
    }
    setDark(prefs.dark);
    setLang(prefs.lang);
    setAccentName(prefs.accent);
    lsSet("m3y_v8_onboarded",true);
    onComplete();
  };

  const sf=(k,v)=>setCo(p=>({...p,[k]:v}));

  const accents=["Blue","Emerald","Gold","Rose","Purple","Orange","Teal","Indigo"];
  const accentColors={Blue:"#3B82F6",Emerald:"#10B981",Gold:"#F59E0B",Rose:"#F43F5E",Purple:"#8B5CF6",Orange:"#F97316",Teal:"#14B8A6",Indigo:"#6366F1"};

  const inp=(v,onChange,ph="",type="text")=>(
    <input type={type} value={v} onChange={e=>onChange(e.target.value)} placeholder={ph}
      style={{width:"100%",padding:"11px 14px",borderRadius:10,border:`1.5px solid ${t.bd}`,background:t.bg3,color:t.tx,fontSize:14,outline:"none",fontFamily:"inherit",marginBottom:12}}
      onFocus={e=>e.target.style.borderColor=t.a} onBlur={e=>e.target.style.borderColor=t.bd}
    />
  );

  return(
    <div style={{position:"fixed",inset:0,zIndex:2000,background:t.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"100%",maxWidth:520}}>
        {/* Progress bar */}
        <div style={{marginBottom:32,padding:"0 4px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            {steps.map((s,i)=>(
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flex:1}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:i<=step?t.a:t.bg3,border:`2px solid ${i<=step?t.a:t.bd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:i<=step?"#fff":t.tx4,transition:"all .3s"}}>
                  {i<step?"✓":i+1}
                </div>
                <div style={{fontSize:9,color:i===step?t.a:t.tx4,fontWeight:i===step?700:500,whiteSpace:"nowrap"}}>{s}</div>
              </div>
            ))}
          </div>
          <div style={{height:4,borderRadius:2,background:t.bg4,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct}%`,background:t.a,borderRadius:2,transition:"width .4s ease"}}/>
          </div>
        </div>

        {/* Step 0: Welcome */}
        {step===0&&(
          <div className="onboard-step" style={{background:t.bg2,borderRadius:24,padding:40,textAlign:"center",border:`1px solid ${t.bd}`}}>
            <div style={{fontSize:56,marginBottom:20,lineHeight:1}}>🚀</div>
            <h1 style={{fontSize:28,fontWeight:900,color:t.tx,marginBottom:12,letterSpacing:-.5}}>Welcome to MASHRO3Y</h1>
            <p style={{fontSize:15,color:t.tx3,lineHeight:1.7,marginBottom:28,maxWidth:340,margin:"0 auto 28px"}}>Your all-in-one enterprise ERP — Finance, HR, CRM, Invoicing, and more. Let's get you set up in 2 minutes.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:28,textAlign:"left"}}>
              {[["🏢","Multi-company"],["🧾","Invoicing & Quotes"],["👷","HR & Payroll"],["📊","Reports & AI"],["💰","Cash Vault"],["🎯","CRM Pipeline"]].map(([i,l])=>(
                <div key={l} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:10,background:t.bg3,fontSize:12,fontWeight:600,color:t.tx2}}>
                  <span style={{fontSize:18}}>{i}</span>{l}
                </div>
              ))}
            </div>
            <button onClick={()=>setStep(1)} style={{padding:"14px 40px",borderRadius:12,background:t.a,color:"#fff",border:"none",fontSize:15,fontWeight:800,cursor:"pointer",width:"100%"}}>
              Get Started →
            </button>
            <button onClick={()=>{lsSet("m3y_v8_onboarded",true);onComplete();}} style={{marginTop:12,background:"none",border:"none",color:t.tx4,fontSize:12,cursor:"pointer",textDecoration:"underline"}}>
              Skip setup, use demo data
            </button>
          </div>
        )}

        {/* Step 1: Company */}
        {step===1&&(
          <div className="onboard-step" style={{background:t.bg2,borderRadius:24,padding:36,border:`1px solid ${t.bd}`}}>
            <div style={{fontSize:32,marginBottom:8}}>🏢</div>
            <h2 style={{fontSize:22,fontWeight:900,color:t.tx,marginBottom:4}}>Your Company</h2>
            <p style={{fontSize:13,color:t.tx4,marginBottom:24}}>Tell us about your main company.</p>
            {inp(co.name,v=>sf("name",v),"Company name *")}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:0}}>
              <select value={co.type} onChange={e=>sf("type",e.target.value)} style={{padding:"11px 14px",borderRadius:10,border:`1.5px solid ${t.bd}`,background:t.bg3,color:t.tx,fontSize:13,outline:"none",marginBottom:12}}>
                {["Trading","Retail","Services","Manufacturing","Consulting","Hospitality","Technology","Real Estate","Other"].map(o=><option key={o} value={o}>{o}</option>)}
              </select>
              <select value={co.currency} onChange={e=>sf("currency",e.target.value)} style={{padding:"11px 14px",borderRadius:10,border:`1.5px solid ${t.bd}`,background:t.bg3,color:t.tx,fontSize:13,outline:"none",marginBottom:12}}>
                {["AED","USD","EUR","GBP","SAR","EGP","KWD","QAR","OMR","BHD","CAD","AUD","JPY"].map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            {inp(co.address,v=>sf("address",v),"Head office address")}
            {inp(co.email,v=>sf("email",v),"Business email","email")}
            <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:12}}>
              <div style={{flex:1,fontSize:12,color:t.tx4,fontWeight:700}}>Brand Color</div>
              <input type="color" value={co.color} onChange={e=>sf("color",e.target.value)} style={{width:40,height:36,padding:2,borderRadius:8,border:`1px solid ${t.bd}`,cursor:"pointer",background:"none"}}/>
              {["#3B82F6","#10B981","#F59E0B","#F43F5E","#8B5CF6","#F97316"].map(c=>(
                <div key={c} onClick={()=>sf("color",c)} style={{width:28,height:28,borderRadius:8,background:c,cursor:"pointer",border:`3px solid ${co.color===c?"#fff":"transparent"}`,boxShadow:co.color===c?`0 0 0 2px ${c}`:"none"}}/>
              ))}
            </div>
            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button onClick={()=>setStep(0)} style={{flex:1,padding:"12px",borderRadius:10,background:t.bg3,color:t.tx,border:`1px solid ${t.bd}`,fontSize:14,fontWeight:700,cursor:"pointer"}}>← Back</button>
              <button onClick={()=>{if(!co.name){alert("Please enter your company name");return;}setStep(2);}} style={{flex:2,padding:"12px",borderRadius:10,background:t.a,color:"#fff",border:"none",fontSize:14,fontWeight:800,cursor:"pointer"}}>Continue →</button>
            </div>
          </div>
        )}

        {/* Step 2: Preferences */}
        {step===2&&(
          <div className="onboard-step" style={{background:t.bg2,borderRadius:24,padding:36,border:`1px solid ${t.bd}`}}>
            <div style={{fontSize:32,marginBottom:8}}>⚙️</div>
            <h2 style={{fontSize:22,fontWeight:900,color:t.tx,marginBottom:4}}>Preferences</h2>
            <p style={{fontSize:13,color:t.tx4,marginBottom:24}}>Customize your experience.</p>

            <div style={{fontSize:11,fontWeight:700,color:t.tx4,letterSpacing:.4,marginBottom:10,textTransform:"uppercase"}}>Theme</div>
            <div style={{display:"flex",gap:8,marginBottom:20}}>
              {[{id:true,label:"🌙 Dark",sub:"Easy on the eyes"},{id:false,label:"☀️ Light",sub:"Classic look"}].map(o=>(
                <button key={String(o.id)} onClick={()=>setPrefs(p=>({...p,dark:o.id}))} style={{flex:1,padding:"12px",borderRadius:12,border:`2px solid ${prefs.dark===o.id?t.a:t.bd}`,background:prefs.dark===o.id?`${t.a}15`:t.bg3,cursor:"pointer",textAlign:"left"}}>
                  <div style={{fontSize:14,fontWeight:700,color:prefs.dark===o.id?t.a:t.tx}}>{o.label}</div>
                  <div style={{fontSize:11,color:t.tx4}}>{o.sub}</div>
                </button>
              ))}
            </div>

            <div style={{fontSize:11,fontWeight:700,color:t.tx4,letterSpacing:.4,marginBottom:10,textTransform:"uppercase"}}>Language</div>
            <div style={{display:"flex",gap:8,marginBottom:20}}>
              {[{id:"en",label:"🇬🇧 English"},{id:"ar",label:"🇦🇪 العربية"}].map(o=>(
                <button key={o.id} onClick={()=>setPrefs(p=>({...p,lang:o.id}))} style={{flex:1,padding:"12px",borderRadius:12,border:`2px solid ${prefs.lang===o.id?t.a:t.bd}`,background:prefs.lang===o.id?`${t.a}15`:t.bg3,color:prefs.lang===o.id?t.a:t.tx,fontWeight:700,fontSize:14,cursor:"pointer"}}>
                  {o.label}
                </button>
              ))}
            </div>

            <div style={{fontSize:11,fontWeight:700,color:t.tx4,letterSpacing:.4,marginBottom:10,textTransform:"uppercase"}}>Accent Color</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:24}}>
              {accents.map(name=>(
                <button key={name} onClick={()=>setPrefs(p=>({...p,accent:name}))} title={name} style={{width:36,height:36,borderRadius:10,background:accentColors[name],border:`3px solid ${prefs.accent===name?"#fff":"transparent"}`,cursor:"pointer",boxShadow:prefs.accent===name?`0 0 0 2px ${accentColors[name]}`:"none",transition:"all .15s"}}/>
              ))}
            </div>

            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setStep(1)} style={{flex:1,padding:"12px",borderRadius:10,background:t.bg3,color:t.tx,border:`1px solid ${t.bd}`,fontSize:14,fontWeight:700,cursor:"pointer"}}>← Back</button>
              <button onClick={()=>setStep(3)} style={{flex:2,padding:"12px",borderRadius:10,background:t.a,color:"#fff",border:"none",fontSize:14,fontWeight:800,cursor:"pointer"}}>Continue →</button>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step===3&&(
          <div className="onboard-step" style={{background:t.bg2,borderRadius:24,padding:40,textAlign:"center",border:`1px solid ${t.bd}`}}>
            <div style={{fontSize:56,marginBottom:16,lineHeight:1,animation:"scaleIn .4s ease"}}>🎉</div>
            <h2 style={{fontSize:26,fontWeight:900,color:t.tx,marginBottom:10}}>You're all set!</h2>
            {co.name&&<p style={{fontSize:15,color:t.tx3,marginBottom:20}}><b style={{color:t.a}}>{co.name}</b> is ready to go.</p>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:28,textAlign:"left"}}>
              {[["✅","Company configured"],["✅","Currency set to "+co.currency],["✅","Theme: "+(prefs.dark?"Dark":"Light")],["✅","Language: "+(prefs.lang==="en"?"English":"العربية")]].map(([i,l])=>(
                <div key={l} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:10,background:t.bg3,fontSize:12,fontWeight:600,color:t.tx2}}>
                  <span style={{fontSize:14}}>{i}</span>{l}
                </div>
              ))}
            </div>
            <button onClick={finish} style={{padding:"14px 40px",borderRadius:12,background:t.a,color:"#fff",border:"none",fontSize:15,fontWeight:800,cursor:"pointer",width:"100%",boxShadow:`0 4px 20px ${t.a}50`}}>
              Enter MASHRO3Y →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  MASHRO3Y v8.3 — NOTIFICATIONS CENTER
// ═══════════════════════════════════════════════════════════
function useNotifications(){
  const {cI,cLR,cW,cPO,cLoans}=useApp();
  return React.useMemo(()=>{
    const notes=[];
    const now=new Date();
    // Overdue invoices
    cI.filter(i=>{const s=invStatus(i);return s==="Overdue";}).forEach(i=>{
      notes.push({id:"inv-"+i.id,type:"warning",icon:"🧾",title:"Overdue Invoice",body:`${i.num} — ${i.clientName} · Balance: ${calcInvBalance(i).toLocaleString()}`,time:i.dueDate,link:"invoices",read:false});
    });
    // Pending leave requests
    cLR.filter(l=>l.status==="Pending").forEach(l=>{
      const w=cW.find(x=>x.id===l.wId);
      notes.push({id:"lr-"+l.id,type:"info",icon:"🏖",title:"Leave Request Pending",body:`${w?.name||"Employee"} · ${l.type} · ${l.days} day(s) from ${fmtDate(l.startDate)}`,time:l.requestDate,link:"workers",read:false});
    });
    // Insurance expiring in 30 days
    cW.filter(w=>w.insuranceExpiry).forEach(w=>{
      const d=daysBetween(today(),w.insuranceExpiry);
      if(d>=0&&d<=30){
        notes.push({id:"ins-"+w.id,type:"warning",icon:"🛡",title:"Insurance Expiring Soon",body:`${w.name} · ${w.insurancePolicy||"Policy"} expires in ${d} days`,time:today(),link:"workers",read:false});
      }
    });
    // POs pending delivery
    cPO.filter(p=>p.status==="Confirmed"&&p.delivDate&&daysBetween(today(),p.delivDate)<=3&&daysBetween(today(),p.delivDate)>=0).forEach(p=>{
      notes.push({id:"po-"+p.id,type:"info",icon:"📦",title:"Delivery Due Soon",body:`${p.num} · Due ${fmtDate(p.delivDate)}`,time:p.delivDate,link:"procurement",read:false});
    });
    return notes.sort((a,b)=>(b.time||"").localeCompare(a.time||""));
  },[cI,cLR,cW,cPO,cLoans]);
}

function NotificationsPanel({onClose,onNavigate}){
  const {t}=useApp();
  const allNotes=useNotifications();
  const [read,setRead]=React.useState(new Set());
  const markAll=()=>setRead(new Set(allNotes.map(n=>n.id)));
  const typeColors={warning:"#F59E0B",info:"#3B82F6",success:"#10B981",danger:"#EF4444"};

  React.useEffect(()=>{
    const h=e=>{if(e.key==="Escape")onClose();};
    document.addEventListener("keydown",h);
    return()=>document.removeEventListener("keydown",h);
  },[onClose]);

  return(
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:499,background:"rgba(0,0,0,.4)",backdropFilter:"blur(2px)"}}/>
      <div className={`notif-panel notif-panel-wrap`} style={{position:"fixed",top:0,right:0,bottom:0,zIndex:500,width:360,maxWidth:"95vw",background:t.bg2,borderLeft:`1px solid ${t.bd}`,display:"flex",flexDirection:"column",boxShadow:"-4px 0 40px rgba(0,0,0,.4)"}}>
        <div style={{padding:"18px 20px 14px",borderBottom:`1px solid ${t.bd}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:t.tx}}>🔔 Notifications</div>
            <div style={{fontSize:11,color:t.tx4,marginTop:2}}>{allNotes.length-read.size} unread</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            {allNotes.length>0&&<button onClick={markAll} style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${t.bd}`,background:t.bg3,color:t.tx3,fontSize:11,fontWeight:700,cursor:"pointer"}}>Mark all read</button>}
            <button onClick={onClose} style={{width:30,height:30,borderRadius:8,border:"none",background:t.bg3,color:t.tx3,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto"}}>
          {allNotes.length===0&&(
            <EmptyState icon="🔕" title="All caught up!" subtitle="No pending notifications right now."/>
          )}
          {allNotes.map(n=>{
            const isRead=read.has(n.id);
            const c=typeColors[n.type]||"#3B82F6";
            return(
              <div key={n.id} onClick={()=>{setRead(p=>new Set([...p,n.id]));onNavigate(n.link);onClose();}}
                style={{padding:"14px 20px",borderBottom:`1px solid ${t.bd}`,cursor:"pointer",background:isRead?"transparent":`${c}06`,transition:"background .15s",position:"relative"}}
                onMouseEnter={e=>e.currentTarget.style.background=t.bg3}
                onMouseLeave={e=>e.currentTarget.style.background=isRead?"transparent":`${c}06`}>
                {!isRead&&<div style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",width:6,height:6,borderRadius:"50%",background:c}}/>}
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{width:38,height:38,borderRadius:10,background:`${c}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{n.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:t.tx,marginBottom:3}}>{n.title}</div>
                    <div style={{fontSize:12,color:t.tx3,lineHeight:1.4}}>{n.body}</div>
                    <div style={{fontSize:10,color:t.tx4,marginTop:5}}>{fmtDate(n.time)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{padding:"12px 20px",borderTop:`1px solid ${t.bd}`,flexShrink:0}}>
          <div style={{fontSize:11,color:t.tx4,textAlign:"center"}}>Notifications are generated from live data</div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  MASHRO3Y v8.3 — KEYBOARD SHORTCUTS PANEL
// ═══════════════════════════════════════════════════════════
function KeyboardShortcutsPanel({onClose}){
  const {t}=useApp();
  const groups=[
    {title:"Navigation",items:[
      {keys:["D"],"action":"Dashboard"},
      {keys:["R"],"action":"Revenue"},
      {keys:["E"],"action":"Expenses"},
      {keys:["I"],"action":"Invoices"},
      {keys:["W"],"action":"Workers"},
      {keys:["C"],"action":"Clients"},
    ]},
    {title:"Quick Actions",items:[
      {keys:["Ctrl","N"],"action":"New Invoice"},
      {keys:["Ctrl","R"],"action":"Add Revenue"},
      {keys:["Ctrl","E"],"action":"Add Expense"},
      {keys:["Ctrl","K"],"action":"Global Search"},
    ]},
    {title:"General",items:[
      {keys:["?"],"action":"Show this shortcuts panel"},
      {keys:["Esc"],"action":"Close modal / panel"},
    ]},
  ];
  return(
    <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:t.bg2,borderRadius:20,width:"100%",maxWidth:480,maxHeight:"80vh",overflow:"hidden",border:`1px solid ${t.bd}`,boxShadow:t.sh2,animation:"modalPop .22s cubic-bezier(.34,1.56,.64,1)"}}>
        <div style={{padding:"18px 22px",borderBottom:`1px solid ${t.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:16,fontWeight:800,color:t.tx}}>⌨️ Keyboard Shortcuts</div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:8,border:"none",background:t.bg3,color:t.tx3,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{padding:22,overflowY:"auto",maxHeight:"calc(80vh - 70px)"}}>
          {groups.map(g=>(
            <div key={g.title} style={{marginBottom:22}}>
              <div style={{fontSize:11,fontWeight:700,color:t.tx4,letterSpacing:.5,textTransform:"uppercase",marginBottom:10}}>{g.title}</div>
              {g.items.map(item=>(
                <div key={item.action} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderRadius:8,background:t.bg3,marginBottom:4}}>
                  <span style={{fontSize:13,color:t.tx2}}>{item.action}</span>
                  <div style={{display:"flex",gap:4}}>
                    {item.keys.map((k,ki)=>(
                      <React.Fragment key={k}>
                        {ki>0&&<span style={{fontSize:11,color:t.tx4,display:"flex",alignItems:"center"}}>+</span>}
                        <kbd style={{display:"inline-block",padding:"2px 8px",borderRadius:5,background:t.bg5||t.bg4,border:`1px solid ${t.bd}`,fontSize:11,fontWeight:700,color:t.tx2,fontFamily:"monospace"}}>{k}</kbd>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  MASHRO3Y v8.3 — TOOLTIP COMPONENT
// ═══════════════════════════════════════════════════════════
function Tooltip({text,children,position="top"}){
  const {t}=useApp();
  const [show,setShow]=React.useState(false);
  return(
    <div style={{position:"relative",display:"inline-flex"}}
      onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}>
      {children}
      {show&&text&&(
        <div style={{
          position:"absolute",
          bottom:position==="top"?"calc(100% + 8px)":undefined,
          top:position==="bottom"?"calc(100% + 8px)":undefined,
          left:"50%",transform:"translateX(-50%)",
          background:t.dark?"#F0F4FF":"#0D1117",
          color:t.dark?"#0D1117":"#F0F4FF",
          fontSize:11,fontWeight:600,padding:"5px 10px",borderRadius:7,
          whiteSpace:"nowrap",pointerEvents:"none",zIndex:9999,
          boxShadow:"0 4px 12px rgba(0,0,0,.3)",
          animation:"tooltipFade .15s ease",
        }}>{text}</div>
      )}
    </div>
  );
}

// ─── QUICK STAT ROW ──────────────────────────────────────────
function QuickStats({items}){
  const {t}=useApp();
  return(
    <div style={{display:"flex",gap:1,background:t.bd,borderRadius:12,overflow:"hidden",marginBottom:20}}>
      {items.map((item,i)=>(
        <div key={i} style={{flex:1,padding:"12px 16px",background:t.bg2,textAlign:"center"}}>
          <div style={{fontSize:18,fontWeight:900,color:item.color||t.a}}>{item.value}</div>
          <div style={{fontSize:10,color:t.tx4,fontWeight:600,marginTop:2}}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  MASHRO3Y v7.0 — WORKERS & HR MODULE
// ═══════════════════════════════════════════════════════════

// ─── WORKER PROFILE PAGE ────────────────────────────────────
function WorkerProfile({worker,onBack}){
  const {t,tr,fmt,acId,cSal,cAbs,cLR,cOT,cLoans,cAdv,setLoans,setAdv,setAbsences,setLeaveReq,setOT,setSalaries,setExps,setWorkers,openModal,showToast}=useApp();
  const [tab,setTab]=React.useState("overview");
  const wId=worker.id;
  const wSal=cSal.filter(s=>s.wId===wId);
  const wAbs=cAbs.filter(a=>a.wId===wId);
  const wLR=cLR.filter(l=>l.wId===wId);
  const wOT=cOT.filter(o=>o.wId===wId);
  const wLoans=cLoans.filter(l=>l.wId===wId);
  const wAdv=cAdv.filter(a=>a.wId===wId);
  const years=yearsWorked(worker.startDate);
  const eosb=calcEOSB(worker.salary,worker.startDate);
  const totalLoan=wLoans.filter(l=>l.status==="Active").reduce((s,l)=>s+l.amount,0);
  const paidLoan=wLoans.reduce((s,l)=>{
    const schedule=loanSchedule(l.amount,l.monthlyDeduction,l.startDate);
    const now=today();
    return s+schedule.filter(p=>p.date<=now).reduce((x,p)=>x+p.paid,0);
  },0);
  const remainingLoan=wLoans.filter(l=>l.status==="Active").reduce((s,l)=>{
    const schedule=loanSchedule(l.amount,l.monthlyDeduction,l.startDate);
    const now=today();
    const remaining=schedule.find(p=>p.date>now);
    return s+(remaining?remaining.remaining:0);
  },0);
  const annualLeaveUsed=wAbs.filter(a=>a.type==="Annual Leave"&&a.paid).length;
  const leaveEntitlement=worker.leaveEntitlement||30;
  const leaveAccrued=Math.min(leaveEntitlement,Math.floor((daysBetween(worker.startDate,today())%365)/365*leaveEntitlement+daysBetween(`${new Date().getFullYear()}-01-01`,today())/365*leaveEntitlement));
  const leaveBalance=Math.max(0,leaveEntitlement-annualLeaveUsed);

  const payNow=()=>{
    const month=monthKey(today());
    const unpaidAbs=wAbs.filter(a=>!a.paid&&a.date.startsWith(month)).length;
    const dailyRate=worker.salary/(worker.workDays||22);
    const absDeduction=unpaidAbs*dailyRate;
    const activeLoan=wLoans.find(l=>l.status==="Active");
    const loanDed=activeLoan?activeLoan.monthlyDeduction:0;
    const pendingAdv=wAdv.filter(a=>a.wId===wId&&a.deductMonth===month&&a.status==="Pending");
    const advDed=pendingAdv.reduce((s,a)=>s+a.amount,0);
    const otHours=wOT.filter(o=>o.date.startsWith(month)&&o.approved);
    const otAmt=otHours.reduce((s,o)=>{
      const rate=o.type.includes("1.5")?(worker.salary/176)*1.5:o.type.includes("2×")?(worker.salary/176)*2:(worker.salary/176)*1.25;
      return s+o.hours*rate;
    },0);
    const gross=worker.salary+otAmt;
    const net=Math.max(0,gross-absDeduction-loanDed-advDed);
    const sal={id:uid(),cId:acId,wId:wId,month,base:worker.salary,loanDeduction:loanDed,advanceDeduction:advDed,absenceDeduction:Math.round(absDeduction),overtimeAdd:Math.round(otAmt),commissionAdd:0,otherAdd:0,otherDeduct:0,net:Math.round(net),paid:true,paidDate:today(),payMethod:"Bank Transfer",notes:`Auto-generated payroll for ${month}`};
    setSalaries(p=>[...p,sal]);
    pendingAdv.forEach(a=>setAdv(p=>p.map(x=>x.id===a.id?{...x,status:"Deducted"}:x)));
    const exp={id:uid(),cId:acId,amount:Math.round(net),cat:"Salaries",description:`Salary — ${worker.name} (${month})`,date:today(),payMethod:"Bank Transfer",vendor:"Internal",ref:`SAL-${month}-${wId}`,notes:"",costCenter:"HR"};
    setExps(p=>[...p,exp]);
    showToast(`Payroll processed: ${fmt(Math.round(net))}`,"success");
  };

  const colors={Active:"#10B981","On Leave":"#F59E0B",Suspended:"#EF4444",Terminated:"#6B7280"};

  return(
    <div style={{minHeight:"100vh",background:t.bg}}>
      {/* Profile Header */}
      <div style={{background:t.bg2,borderBottom:`1px solid ${t.bd}`,padding:"20px 24px"}}>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:t.tx3,cursor:"pointer",fontSize:13,fontWeight:600,marginBottom:16}}>← Back to Workers</button>
        <div style={{display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap"}}>
          <Avatar name={worker.name} photo={worker.photo} size={80} color={colors[worker.status]}/>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:6}}>
              <h1 style={{fontSize:24,fontWeight:900,color:t.tx,margin:0}}>{worker.name}</h1>
              <Badge status={worker.status}/>
              {remainingLoan>0&&<Badge status="Has Loan"/>}
            </div>
            <div style={{fontSize:15,color:t.tx3,marginBottom:2}}>{worker.role} · {worker.dept}</div>
            <div style={{fontSize:13,color:t.tx4}}>Employee since {fmtDate(worker.startDate)} · {years.toFixed(1)} years · ID: {worker.idNum||"—"}</div>
            <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
              {worker.phone&&<a href={`tel:${worker.phone}`} style={{fontSize:12,color:t.a,textDecoration:"none"}}>📞 {worker.phone}</a>}
              {worker.email&&<a href={`mailto:${worker.email}`} style={{fontSize:12,color:t.a,textDecoration:"none"}}>✉ {worker.email}</a>}
            </div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <Btn onClick={payNow} variant="success" icon="💰">Pay Now</Btn>
            <Btn onClick={()=>openModal("worker",worker)} variant="secondary" icon="✏">Edit</Btn>
            <Btn onClick={()=>openModal("workerLoan",{wId})} variant="warning" icon="💳">New Loan</Btn>
            <Btn onClick={()=>openModal("payslip",{worker,wSal,wAbs,wOT,wLoans,wAdv})} variant="ghost" icon="🖨">Payslip</Btn>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{padding:"16px 24px 0"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:20}}>
          {[
            {label:"Base Salary",value:fmt(worker.salary),color:t.a,icon:"💰"},
            {label:"Leave Balance",value:`${leaveBalance}/${leaveEntitlement} days`,color:"#3B82F6",icon:"🏖"},
            {label:"Loan Balance",value:remainingLoan>0?fmt(remainingLoan):"None",color:remainingLoan>0?"#EF4444":"#10B981",icon:"💳"},
            {label:"EOSB Estimate",value:fmt(eosb),color:"#8B5CF6",icon:"🏅"},
            {label:"Absences (yr)",value:wAbs.length+" days",color:"#F59E0B",icon:"📅"},
            {label:"Payrolls Paid",value:wSal.filter(s=>s.paid).length+" months",color:"#10B981",icon:"✅"},
          ].map((s,i)=>(
            <div key={i} style={{background:t.bg2,borderRadius:12,padding:"14px 16px",border:`1px solid ${t.bd}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:11,color:t.tx4,fontWeight:600,textTransform:"uppercase"}}>{s.label}</span>
                <span style={{fontSize:16}}>{s.icon}</span>
              </div>
              <div style={{fontSize:16,fontWeight:800,color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>

        <Tabs tabs={[
          {id:"overview",label:"Profile",icon:"👤"},
          {id:"attendance",label:"Attendance",icon:"📅",count:wAbs.length},
          {id:"leaves",label:"Leave Requests",icon:"🏖",count:wLR.length},
          {id:"loans",label:"Loans & Advances",icon:"💳",count:wLoans.length+wAdv.length},
          {id:"payroll",label:"Payroll History",icon:"💰",count:wSal.length},
          {id:"overtime",label:"Overtime",icon:"⏱",count:wOT.length},
        ]} active={tab} onChange={setTab}/>
      </div>

      <div style={{padding:"0 24px 24px"}}>
        {/* OVERVIEW TAB */}
        {tab==="overview"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <Section title="Personal Information" icon="👤">
              <InfoGrid cols={2} items={[
                {label:"Full Name",value:worker.name},
                {label:"Date of Birth",value:fmtDate(worker.dob)},
                {label:"Gender",value:worker.gender},
                {label:"Nationality",value:worker.nationality},
                {label:"Emirates ID / National ID",value:worker.idNum},
                {label:"Passport Number",value:worker.passportNum},
                {label:"Personal Phone",value:worker.phone},
                {label:"Work Email",value:worker.email},
                {label:"Emergency Contact",value:worker.emergencyContact},
                {label:"Notes",value:worker.notes},
              ]}/>
            </Section>
            <Section title="Employment Details" icon="💼">
              <InfoGrid cols={2} items={[
                {label:"Job Role",value:worker.role},
                {label:"Department",value:worker.dept},
                {label:"Start Date",value:fmtDate(worker.startDate)},
                {label:"Years of Service",value:years.toFixed(1)+" years"},
                {label:"Employment Status",value:<Badge status={worker.status}/>},
                {label:"Base Salary",value:fmt(worker.salary),color:t.a},
                {label:"Leave Entitlement",value:`${leaveEntitlement} days/year`},
                {label:"Leave Balance",value:`${leaveBalance} days remaining`,color:leaveBalance<5?"#EF4444":"#10B981"},
                {label:"Insurance Policy",value:worker.insurancePolicy},
                {label:"Insurance Expiry",value:fmtDate(worker.insuranceExpiry),color:worker.insuranceExpiry&&new Date(worker.insuranceExpiry)<new Date(Date.now()+30*864e5)?"#EF4444":undefined},
              ]}/>
            </Section>
            <Section title="End of Service Estimate" icon="🏅">
              <div style={{background:`${t.a}10`,borderRadius:12,padding:16,marginBottom:12}}>
                <div style={{fontSize:11,color:t.tx4,marginBottom:4}}>EOSB (Resignation scenario)</div>
                <div style={{fontSize:28,fontWeight:900,color:t.a}}>{fmt(eosb)}</div>
                <div style={{fontSize:12,color:t.tx4,marginTop:4}}>Based on {years.toFixed(1)} yrs · Salary {fmt(worker.salary)}</div>
              </div>
              <div style={{background:"#EF444410",borderRadius:12,padding:16}}>
                <div style={{fontSize:11,color:t.tx4,marginBottom:4}}>EOSB (Termination scenario)</div>
                <div style={{fontSize:22,fontWeight:800,color:"#EF4444"}}>{fmt(calcEOSB(worker.salary,worker.startDate,today(),"termination"))}</div>
              </div>
            </Section>
            <Section title="Active Loans Summary" icon="💳">
              {wLoans.filter(l=>l.status==="Active").length===0?
                <div style={{color:t.tx4,textAlign:"center",padding:20}}>No active loans</div>:
                wLoans.filter(l=>l.status==="Active").map(loan=>(
                  <div key={loan.id} style={{background:t.bg3,borderRadius:10,padding:14,marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                      <div style={{fontWeight:700,color:t.tx}}>{loan.reason}</div>
                      <Badge status="Active"/>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,fontSize:12}}>
                      <div><div style={{color:t.tx4}}>Original</div><div style={{fontWeight:700,color:t.tx}}>{fmt(loan.amount)}</div></div>
                      <div><div style={{color:t.tx4}}>Monthly</div><div style={{fontWeight:700,color:"#EF4444"}}>-{fmt(loan.monthlyDeduction)}</div></div>
                      <div><div style={{color:t.tx4}}>Remaining</div><div style={{fontWeight:700,color:"#F59E0B"}}>{fmt(remainingLoan)}</div></div>
                    </div>
                    <ProgressBar value={loan.amount-remainingLoan} max={loan.amount} color="#10B981" height={6} showLabel={true}/>
                  </div>
                ))
              }
            </Section>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {tab==="attendance"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{display:"flex",gap:12}}>
                {[
                  {label:"Total Absences",value:wAbs.length,color:t.tx},
                  {label:"Paid",value:wAbs.filter(a=>a.paid).length,color:"#10B981"},
                  {label:"Unpaid",value:wAbs.filter(a=>!a.paid).length,color:"#EF4444"},
                  {label:"Days Cost",value:fmt(wAbs.filter(a=>!a.paid).length*(worker.salary/22)),color:"#EF4444"},
                ].map((s,i)=>(
                  <div key={i} style={{background:t.bg2,borderRadius:10,padding:"10px 14px",border:`1px solid ${t.bd}`}}>
                    <div style={{fontSize:11,color:t.tx4}}>{s.label}</div>
                    <div style={{fontSize:16,fontWeight:800,color:s.color}}>{s.value}</div>
                  </div>
                ))}
              </div>
              <Btn onClick={()=>openModal("absence",{wId})} variant="secondary" icon="＋">Mark Absence</Btn>
            </div>
            <Card>
              <Table
                cols={[
                  {key:"date",label:"Date",render:v=><span style={{color:t.tx3}}>{fmtDate(v)}</span>},
                  {key:"type",label:"Type",render:v=><Badge status={v}/>},
                  {key:"hours",label:"Hours",right:true,render:v=><span>{v||9}h</span>},
                  {key:"paid",label:"Paid Leave",render:v=><Badge status={v?"Paid":"Unpaid"}/>},
                  {key:"approved",label:"Status",render:v=><Badge status={v?"Approved":"Pending"}/>},
                  {key:"notes",label:"Notes",wrap:true,render:v=><span style={{color:t.tx4,fontSize:12}}>{v||"—"}</span>},
                ]}
                rows={[...wAbs].sort((a,b)=>b.date.localeCompare(a.date))}
                actions={row=>(
                  <Btn size="sm" variant="danger" onClick={()=>setAbsences(p=>p.filter(x=>x.id!==row.id))}>×</Btn>
                )}
              />
            </Card>
          </div>
        )}

        {/* LEAVE REQUESTS TAB */}
        {tab==="leaves"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
              <div style={{display:"flex",gap:12}}>
                {[
                  {label:"Leave Balance",value:`${leaveBalance} days`,color:"#10B981"},
                  {label:"Used This Year",value:`${annualLeaveUsed} days`,color:"#F59E0B"},
                  {label:"Pending Requests",value:wLR.filter(l=>l.status==="Pending").length,color:"#3B82F6"},
                ].map((s,i)=>(
                  <div key={i} style={{background:t.bg2,borderRadius:10,padding:"10px 14px",border:`1px solid ${t.bd}`}}>
                    <div style={{fontSize:11,color:t.tx4}}>{s.label}</div>
                    <div style={{fontSize:16,fontWeight:800,color:s.color}}>{s.value}</div>
                  </div>
                ))}
              </div>
              <Btn onClick={()=>openModal("leaveRequest",{wId})} variant="secondary" icon="＋">New Request</Btn>
            </div>
            <Card>
              <Table
                cols={[
                  {key:"type",label:"Type",render:v=><Badge status={v}/>},
                  {key:"startDate",label:"From",render:v=><span style={{color:t.tx3}}>{fmtDate(v)}</span>},
                  {key:"endDate",label:"To",render:v=><span style={{color:t.tx3}}>{fmtDate(v)}</span>},
                  {key:"days",label:"Days",center:true,render:v=><b>{v}</b>},
                  {key:"status",label:"Status",render:v=><Badge status={v}/>},
                  {key:"approvedBy",label:"Approved By",render:v=><span style={{color:t.tx4,fontSize:12}}>{v||"—"}</span>},
                  {key:"notes",label:"Notes",wrap:true,render:v=><span style={{color:t.tx4,fontSize:12}}>{v||"—"}</span>},
                ]}
                rows={[...wLR].sort((a,b)=>b.requestDate.localeCompare(a.requestDate))}
                actions={row=>(
                  <div style={{display:"flex",gap:4}}>
                    {row.status==="Pending"&&<>
                      <Btn size="sm" variant="success" onClick={()=>setLeaveReq(p=>p.map(x=>x.id===row.id?{...x,status:"Approved",approvedBy:"Management"}:x))}>✓</Btn>
                      <Btn size="sm" variant="danger" onClick={()=>setLeaveReq(p=>p.map(x=>x.id===row.id?{...x,status:"Rejected"}:x))}>✗</Btn>
                    </>}
                  </div>
                )}
              />
            </Card>
          </div>
        )}

        {/* LOANS & ADVANCES TAB */}
        {tab==="loans"&&(
          <div>
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              <Btn onClick={()=>openModal("workerLoan",{wId})} variant="warning" icon="💳">New Loan</Btn>
              <Btn onClick={()=>openModal("workerAdvance",{wId})} variant="secondary" icon="💵">Salary Advance</Btn>
            </div>
            {wLoans.length>0&&(
              <Section title="Loans" icon="💳">
                {wLoans.map(loan=>{
                  const schedule=loanSchedule(loan.amount,loan.monthlyDeduction,loan.startDate);
                  const paidPmts=schedule.filter(p=>p.date<=today());
                  const paidAmt=paidPmts.reduce((s,p)=>s+p.paid,0);
                  const rem=Math.max(0,loan.amount-paidAmt);
                  return(
                    <div key={loan.id} style={{background:t.bg3,borderRadius:12,padding:16,marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                        <div>
                          <div style={{fontWeight:700,color:t.tx}}>{loan.reason}</div>
                          <div style={{fontSize:12,color:t.tx4}}>Approved: {fmtDate(loan.approvedDate)} by {loan.approvedBy}</div>
                        </div>
                        <Badge status={loan.status}/>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:12,fontSize:12}}>
                        <div><div style={{color:t.tx4}}>Loan Amount</div><div style={{fontWeight:700,color:t.tx,fontSize:14}}>{fmt(loan.amount)}</div></div>
                        <div><div style={{color:t.tx4}}>Monthly Deduction</div><div style={{fontWeight:700,color:"#EF4444",fontSize:14}}>-{fmt(loan.monthlyDeduction)}</div></div>
                        <div><div style={{color:t.tx4}}>Amount Paid</div><div style={{fontWeight:700,color:"#10B981",fontSize:14}}>{fmt(paidAmt)}</div></div>
                        <div><div style={{color:t.tx4}}>Remaining</div><div style={{fontWeight:700,color:"#F59E0B",fontSize:14}}>{fmt(rem)}</div></div>
                      </div>
                      <ProgressBar value={paidAmt} max={loan.amount} color="#10B981" height={8} showLabel={true}/>
                      <div style={{fontSize:11,color:t.tx4,marginTop:8}}>
                        {paidPmts.length} of {schedule.length} payments made · Estimated completion: {schedule[schedule.length-1]?.date||"—"}
                      </div>
                    </div>
                  );
                })}
              </Section>
            )}
            {wAdv.length>0&&(
              <Section title="Salary Advances" icon="💵">
                <Table
                  cols={[
                    {key:"date",label:"Date",render:v=><span style={{color:t.tx3}}>{fmtDate(v)}</span>},
                    {key:"amount",label:"Amount",right:true,render:v=><span style={{fontWeight:700,color:"#F59E0B"}}>{fmt(v)}</span>},
                    {key:"deductMonth",label:"Deduct Month",render:v=><span style={{color:t.tx3}}>{monthName(v)}</span>},
                    {key:"reason",label:"Reason",wrap:true},
                    {key:"status",label:"Status",render:v=><Badge status={v}/>},
                    {key:"approvedBy",label:"Approved By",render:v=><span style={{color:t.tx4,fontSize:12}}>{v||"Pending"}</span>},
                  ]}
                  rows={[...wAdv].sort((a,b)=>b.date.localeCompare(a.date))}
                  actions={row=>(
                    row.status==="Pending"&&<Btn size="sm" variant="success" onClick={()=>setAdv(p=>p.map(x=>x.id===row.id?{...x,status:"Approved",approvedBy:"Management"}:x))}>Approve</Btn>
                  )}
                />
              </Section>
            )}
          </div>
        )}

        {/* PAYROLL TAB */}
        {tab==="payroll"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
              <div style={{fontSize:14,color:t.tx3}}>
                Total paid: <b style={{color:"#10B981"}}>{fmt(wSal.filter(s=>s.paid).reduce((s,x)=>s+x.net,0))}</b>
              </div>
              <Btn onClick={payNow} variant="success" icon="💰">Process This Month</Btn>
            </div>
            <Card>
              <Table
                cols={[
                  {key:"month",label:"Month",render:v=><b style={{color:t.tx}}>{monthName(v)}</b>},
                  {key:"base",label:"Base",right:true,render:v=><span>{fmt(v)}</span>},
                  {key:"overtimeAdd",label:"Overtime",right:true,render:v=><span style={{color:"#10B981"}}>{v?"+"+fmt(v):"—"}</span>},
                  {key:"commissionAdd",label:"Commission",right:true,render:v=><span style={{color:"#10B981"}}>{v?"+"+fmt(v):"—"}</span>},
                  {key:"loanDeduction",label:"Loan",right:true,render:v=><span style={{color:"#EF4444"}}>{v?"-"+fmt(v):"—"}</span>},
                  {key:"absenceDeduction",label:"Absences",right:true,render:v=><span style={{color:"#EF4444"}}>{v?"-"+fmt(v):"—"}</span>},
                  {key:"net",label:"Net Pay",right:true,render:v=><span style={{fontWeight:900,color:t.a,fontSize:14}}>{fmt(v)}</span>},
                  {key:"paid",label:"Status",render:v=><Badge status={v?"Paid":"Pending"}/>},
                  {key:"paidDate",label:"Paid On",render:v=><span style={{color:t.tx4,fontSize:12}}>{fmtDate(v)}</span>},
                ]}
                rows={[...wSal].sort((a,b)=>b.month.localeCompare(a.month))}
              />
            </Card>
          </div>
        )}

        {/* OVERTIME TAB */}
        {tab==="overtime"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
              <div style={{fontSize:14,color:t.tx3}}>
                Total OT: <b>{wOT.reduce((s,o)=>s+o.hours,0)}h</b> · Value: <b style={{color:"#10B981"}}>{fmt(wOT.reduce((s,o)=>{const r=o.type.includes("1.5")?(worker.salary/176)*1.5:o.type.includes("2×")?(worker.salary/176)*2:(worker.salary/176)*1.25;return s+o.hours*r;},0))}</b>
              </div>
              <Btn onClick={()=>openModal("overtime",{wId})} variant="secondary" icon="＋">Log Overtime</Btn>
            </div>
            <Card>
              <Table
                cols={[
                  {key:"date",label:"Date",render:v=><span style={{color:t.tx3}}>{fmtDate(v)}</span>},
                  {key:"hours",label:"Hours",right:true,render:v=><b>{v}h</b>},
                  {key:"type",label:"Type",render:v=><Badge status={v.split("(")[0].trim()}/>},
                  {key:"reason",label:"Reason",wrap:true},
                  {key:"approved",label:"Status",render:v=><Badge status={v?"Approved":"Pending"}/>},
                  {key:"_amt",label:"Amount",right:true,render:(v,row)=>{const r=row.type.includes("1.5")?(worker.salary/176)*1.5:row.type.includes("2×")?(worker.salary/176)*2:(worker.salary/176)*1.25;return<span style={{fontWeight:700,color:"#10B981"}}>+{fmt(row.hours*r)}</span>;}},
                ]}
                rows={[...wOT].sort((a,b)=>b.date.localeCompare(a.date))}
                actions={row=>(
                  <div style={{display:"flex",gap:4}}>
                    {!row.approved&&<Btn size="sm" variant="success" onClick={()=>setOT(p=>p.map(x=>x.id===row.id?{...x,approved:true}:x))}>✓</Btn>}
                    <Btn size="sm" variant="danger" onClick={()=>setOT(p=>p.filter(x=>x.id!==row.id))}>×</Btn>
                  </div>
                )}
              />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── WORKERS LIST PAGE ───────────────────────────────────────
function WorkersPage(){
  const {t,tr,fmt,cW,cSal,cAbs,cLoans,cAdv,setWorkers,openModal,acId}=useApp();
  const [search,setSearch]=React.useState("");
  const [deptFilter,setDeptFilter]=React.useState("all");
  const [selectedWorker,setSelectedWorker]=React.useState(null);
  const [tab,setTab]=React.useState("list");

  if(selectedWorker)return<WorkerProfile worker={selectedWorker} onBack={()=>setSelectedWorker(null)}/>;

  const filtered=React.useMemo(()=>cW.filter(w=>{
    const s=search.toLowerCase();
    return(!s||(w.name||"").toLowerCase().includes(s)||(w.role||"").toLowerCase().includes(s)||(w.dept||"").toLowerCase().includes(s))&&
      (deptFilter==="all"||w.dept===deptFilter);
  }),[cW,search,deptFilter]);

  const depts=[...new Set(cW.map(w=>w.dept).filter(Boolean))];
  const totalPayroll=cW.filter(w=>w.status==="Active").reduce((s,w)=>s+w.salary,0);
  const activeLoans=cLoans.filter(l=>l.status==="Active");
  const totalLoanBalance=activeLoans.reduce((s,l)=>{
    const sch=loanSchedule(l.amount,l.monthlyDeduction,l.startDate);
    const rem=sch.find(p=>p.date>today());
    return s+(rem?rem.remaining:0);
  },0);

  return(
    <div style={{padding:24}}>
      <PageHeader title="Workers & HR" icon="👷" subtitle={`${cW.filter(w=>w.status==="Active").length} active · ${cW.length} total · Payroll: ${fmt(totalPayroll)}/mo`}
        actions={<>
          <Btn onClick={()=>openModal("absence",{})} variant="ghost" icon="📅">Mark Absence</Btn>
          <Btn onClick={()=>openModal("leaveRequest",{})} variant="secondary" icon="🏖">Leave Request</Btn>
          <Btn onClick={()=>openModal("worker",{})} variant="primary" icon="＋">Add Employee</Btn>
        </>}
      />

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:20}}>
        <StatCard label="Total Employees" value={cW.length} sub={`${cW.filter(w=>w.status==="Active").length} active`} icon="👷" color="#8B5CF6"/>
        <StatCard label="Monthly Payroll" value={fmt(totalPayroll)} sub="Active staff" icon="💰" color="#10B981"/>
        <StatCard label="On Leave" value={cW.filter(w=>w.status==="On Leave").length} icon="🏖" color="#F59E0B"/>
        <StatCard label="Active Loans" value={activeLoans.length} sub={`Balance: ${fmt(totalLoanBalance)}`} icon="💳" color="#EF4444"/>
        <StatCard label="Pending Leaves" value={[]} sub="Requests" icon="📋" color="#3B82F6"/>
      </div>

      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search employees..."/>
        <select value={deptFilter} onChange={e=>setDeptFilter(e.target.value)} style={{padding:"9px 14px",borderRadius:10,border:`1.5px solid ${t.bd}`,background:t.bg2,color:t.tx,fontSize:13,outline:"none"}}>
          <option value="all">All Departments</option>
          {depts.map(d=><option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Employee Cards Grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
        {filtered.map(worker=>{
          const wLoans=cLoans.filter(l=>l.wId===worker.id&&l.status==="Active");
          const wAbs=cAbs.filter(a=>a.wId===worker.id);
          const thisMonthSal=cSal.find(s=>s.wId===worker.id&&s.month===monthKey(today()));
          const colors={Active:"#10B981","On Leave":"#F59E0B",Suspended:"#EF4444",Terminated:"#6B7280"};
          return(
            <div key={worker.id} onClick={()=>setSelectedWorker(worker)}
              style={{background:t.bg2,borderRadius:16,border:`1px solid ${t.bd}`,padding:20,cursor:"pointer",transition:"all .15s",boxShadow:t.sh}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.borderColor=t.a;e.currentTarget.style.boxShadow=t.sh2;}}
              onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor=t.bd;e.currentTarget.style.boxShadow=t.sh;}}>
              <div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:14}}>
                <Avatar name={worker.name} photo={worker.photo} size={52} color={colors[worker.status]}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:15,fontWeight:800,color:t.tx,marginBottom:2}}>{worker.name}</div>
                  <div style={{fontSize:12,color:t.tx3}}>{worker.role}</div>
                  <div style={{fontSize:11,color:t.tx4}}>{worker.dept} · {yearsWorked(worker.startDate).toFixed(1)}y</div>
                </div>
                <Badge status={worker.status}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                <div style={{background:t.bg3,borderRadius:8,padding:"8px 10px"}}>
                  <div style={{fontSize:10,color:t.tx4}}>Salary</div>
                  <div style={{fontSize:12,fontWeight:700,color:t.a}}>{fmt(worker.salary)}</div>
                </div>
                <div style={{background:t.bg3,borderRadius:8,padding:"8px 10px"}}>
                  <div style={{fontSize:10,color:t.tx4}}>Absences</div>
                  <div style={{fontSize:12,fontWeight:700,color:wAbs.length>5?"#EF4444":"#10B981"}}>{wAbs.length} days</div>
                </div>
                <div style={{background:t.bg3,borderRadius:8,padding:"8px 10px"}}>
                  <div style={{fontSize:10,color:t.tx4}}>Feb Payroll</div>
                  <div style={{fontSize:12,fontWeight:700,color:thisMonthSal?"#10B981":"#F59E0B"}}>{thisMonthSal?"Paid":"Pending"}</div>
                </div>
              </div>
              {wLoans.length>0&&(
                <div style={{background:"#EF444410",borderRadius:8,padding:"6px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:11,color:"#EF4444",fontWeight:600}}>💳 Active Loan</span>
                  <span style={{fontSize:11,color:"#EF4444",fontWeight:700}}>-{fmt(wLoans[0].monthlyDeduction)}/mo</span>
                </div>
              )}
              <div style={{display:"flex",gap:6,marginTop:12}}>
                <Btn size="sm" variant="ghost" onClick={e=>{e.stopPropagation();openModal("absence",{wId:worker.id});}}>Mark Absent</Btn>
                <Btn size="sm" variant="secondary" onClick={e=>{e.stopPropagation();openModal("worker",worker);}}>✏</Btn>
              </div>
            </div>
          );
        })}
        {filtered.length===0&&(
          <div style={{gridColumn:"1/-1",textAlign:"center",padding:48,color:t.tx4}}>
            <div style={{fontSize:32,marginBottom:8}}>👷</div>
            <div style={{fontWeight:600}}>No employees found</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  MASHRO3Y v7.0 — CLIENTS & CRM MODULE
// ═══════════════════════════════════════════════════════════

// ─── CLIENT PROFILE ──────────────────────────────────────────
function ClientProfile({client,onBack}){
  const {t,tr,fmt,cI,cQ,cR,cCRM,openModal,setClis,acId,lang}=useApp();
  const [tab,setTab]=React.useState("overview");
  const [notes,setNotes]=React.useState(()=>{try{return JSON.parse(localStorage.getItem("m3y_cnotes_"+client.id)||"[]");}catch{return[];}});
  const [noteText,setNoteText]=React.useState("");
  const [view,setView]=React.useState("cards"); // cards | table
  const cInvs=cI.filter(i=>i.clientId===client.id);
  const cQuotes=cQ.filter(q=>q.clientId===client.id);
  const cRevs=cR.filter(r=>r.customerId===client.id);
  const cLeads=cCRM.filter(l=>l.clientId===client.id||l.email===client.email);
  const [docs,setDocs]=React.useState(()=>{try{return JSON.parse(localStorage.getItem("m3y_cdocs_"+client.id)||"[]");}catch{return[];}});
  const [docName,setDocName]=React.useState("");const [docType,setDocType]=React.useState("Contract");
  const addDoc=()=>{if(!docName.trim())return;const d={id:uid(),name:docName.trim(),type:docType,date:today(),size:"—",notes:""};const updated=[d,...docs];setDocs(updated);localStorage.setItem("m3y_cdocs_"+client.id,JSON.stringify(updated));setDocName("");};
  const delDoc=(id)=>{const updated=docs.filter(d=>d.id!==id);setDocs(updated);localStorage.setItem("m3y_cdocs_"+client.id,JSON.stringify(updated));};
  const totalRevenue=cRevs.reduce((s,r)=>s+r.amount,0);
  const totalInvoiced=cInvs.reduce((s,i)=>s+calcInvTotal(i),0);
  const totalPaid=cInvs.reduce((s,i)=>s+(i.paid||0),0);
  const outstanding=totalInvoiced-totalPaid;
  const overdueInvs=cInvs.filter(i=>invStatus(i)==="Overdue");
  const avgPayDays=cInvs.filter(i=>i.paid&&i.paidDate&&i.date).reduce((acc,i,_,arr)=>acc+daysBetween(i.date,i.paidDate)/arr.length,0);

  const saveNote=()=>{
    if(!noteText.trim())return;
    const n={id:uid(),text:noteText.trim(),date:today(),author:"You"};
    const updated=[n,...notes];
    setNotes(updated);
    localStorage.setItem("m3y_cnotes_"+client.id,JSON.stringify(updated));
    setNoteText("");
  };
  const deleteNote=(id)=>{const updated=notes.filter(n=>n.id!==id);setNotes(updated);localStorage.setItem("m3y_cnotes_"+client.id,JSON.stringify(updated));};

  const exportStatement=()=>{
    const lines=["CLIENT STATEMENT","","Client: "+client.name,"Company: "+(client.company||"—"),"Date: "+fmtDate(today()),"","━━━ INVOICES ━━━",""];
    cInvs.sort((a,b)=>a.date.localeCompare(b.date)).forEach(i=>{
      lines.push(`${i.num} | ${fmtDate(i.date)} | Due: ${fmtDate(i.dueDate)} | ${fmt(calcInvTotal(i))} | ${invStatus(i)}`);
    });
    lines.push("","━━━ REVENUE ━━━","");
    cRevs.sort((a,b)=>a.date.localeCompare(b.date)).forEach(r=>{
      lines.push(`${fmtDate(r.date)} | ${r.description} | ${fmt(r.amount)} | ${r.payMethod}`);
    });
    lines.push("","━━━ SUMMARY ━━━","");
    lines.push("Total Invoiced: "+fmt(totalInvoiced));
    lines.push("Total Paid: "+fmt(totalPaid));
    lines.push("Outstanding: "+fmt(outstanding));
    lines.push("Total Revenue: "+fmt(totalRevenue));
    const win=window.open("","_blank");
    win.document.write(`<html><head><title>Statement — ${client.name}</title><style>body{font-family:monospace;padding:40px;font-size:13px;line-height:1.8;white-space:pre}</style></head><body>${lines.join("\n")}</body></html>`);
    win.print();
  };

  return(
    <div style={{minHeight:"100vh",background:t.bg}}>
      {/* Header */}
      <div style={{background:t.bg2,borderBottom:`1px solid ${t.bd}`,padding:"20px 24px"}}>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:t.tx3,cursor:"pointer",fontSize:13,fontWeight:600,marginBottom:16}}>← {tr.back}</button>
        <div style={{display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap"}}>
          <Avatar name={client.name} photo={client.photo} size={72}/>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap",marginBottom:5}}>
              <h1 style={{fontSize:22,fontWeight:900,color:t.tx,margin:0}}>{client.name}</h1>
              {overdueInvs.length>0&&<Badge status="Overdue"/>}
              {client.tags?.map((tag,i)=><span key={i} style={{padding:"2px 10px",borderRadius:20,background:`${t.a}20`,color:t.a,fontSize:11,fontWeight:700}}>{tag}</span>)}
            </div>
            <div style={{fontSize:14,color:t.tx3,marginBottom:2}}>{client.position}{client.company?" · "+client.company:""}</div>
            <div style={{fontSize:12,color:t.tx4,marginBottom:8}}>{client.address}</div>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              {client.phone&&<a href={`tel:${client.phone}`} style={{fontSize:12,color:t.a,textDecoration:"none"}}>📞 {client.phone}</a>}
              {client.email&&<a href={`mailto:${client.email}`} style={{fontSize:12,color:t.a,textDecoration:"none"}}>✉ {client.email}</a>}
              {client.website&&<a href={"https://"+client.website} target="_blank" style={{fontSize:12,color:t.a,textDecoration:"none"}}>🌐 {client.website}</a>}
            </div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <Btn onClick={()=>openModal("invoice",{clientId:client.id,clientName:client.name,clientEmail:client.email,clientAddress:client.address})} variant="primary" icon="🧾">{lang==="ar"?"فاتورة جديدة":"New Invoice"}</Btn>
            <Btn onClick={()=>openModal("quote",{clientId:client.id,clientName:client.name,clientEmail:client.email,clientAddress:client.address})} variant="secondary" icon="📋">{lang==="ar"?"عرض سعر":"Quote"}</Btn>
            <Btn onClick={()=>openModal("client",client)} variant="secondary" icon="✏">{tr.edit}</Btn>
            <Btn onClick={exportStatement} variant="ghost" icon="📄">{lang==="ar"?"تصدير الكشف":"Statement"}</Btn>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{padding:"16px 24px 0"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10,marginBottom:16}}>
          {[
            {label:lang==="ar"?"إجمالي الإيرادات":"Total Revenue",value:fmt(totalRevenue),color:"#10B981",icon:"💰"},
            {label:lang==="ar"?"إجمالي الفواتير":"Invoiced",value:fmt(totalInvoiced),color:t.a,icon:"🧾"},
            {label:lang==="ar"?"المدفوع":"Paid",value:fmt(totalPaid),color:"#10B981",icon:"✅"},
            {label:lang==="ar"?"المستحق":"Outstanding",value:fmt(outstanding),color:outstanding>0?"#EF4444":"#10B981",icon:"⏳"},
            {label:lang==="ar"?"حد الائتمان":"Credit Limit",value:fmt(client.creditLimit||0),color:"#8B5CF6",icon:"💳"},
            {label:lang==="ar"?"متوسط الدفع":"Avg Pay",value:Math.round(avgPayDays)+" d",color:"#F59E0B",icon:"📅"},
          ].map((s,i)=>(
            <div key={i} style={{background:t.bg2,borderRadius:12,padding:"12px 14px",border:`1px solid ${t.bd}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:10,color:t.tx4,fontWeight:700,textTransform:"uppercase"}}>{s.label}</span>
                <span style={{fontSize:15}}>{s.icon}</span>
              </div>
              <div style={{fontSize:15,fontWeight:800,color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>

        {outstanding>0&&outstanding>(client.creditLimit||0)&&(
          <div style={{background:"#EF444415",border:"1px solid #EF444440",borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",gap:10,alignItems:"center"}}>
            <span style={{fontSize:18}}>⚠️</span>
            <div><div style={{fontWeight:700,color:"#EF4444",fontSize:13}}>{lang==="ar"?"تم تجاوز حد الائتمان":"Credit Limit Exceeded"}</div>
            <div style={{fontSize:12,color:t.tx3}}>{fmt(outstanding)} {lang==="ar"?"يتجاوز الحد":"exceeds limit of"} {fmt(client.creditLimit||0)}</div></div>
          </div>
        )}

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:4}}>
          <Tabs tabs={[
            {id:"overview",label:lang==="ar"?"نظرة عامة":"Overview",icon:"👤"},
            {id:"invoices",label:tr.invoices,icon:"🧾",count:cInvs.length},
            {id:"quotes",label:tr.quotes,icon:"📋",count:cQuotes.length},
            {id:"transactions",label:lang==="ar"?"المعاملات":"Transactions",icon:"💸",count:cRevs.length},
            {id:"statement",label:lang==="ar"?"الكشف":"Statement",icon:"📄"},
            {id:"notes",label:lang==="ar"?"الملاحظات":"Notes",icon:"📝",count:notes.length},
            {id:"crm",label:"CRM",icon:"🤝",count:cLeads.length},
            {id:"documents",label:lang==="ar"?"المستندات":"Documents",icon:"📁"},
          ]} active={tab} onChange={setTab}/>
        </div>
      </div>

      <div style={{padding:"0 24px 24px"}}>
        {/* OVERVIEW */}
        {tab==="overview"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:16}}>
            <Section title={lang==="ar"?"معلومات الاتصال":"Contact Info"} icon="📞">
              <InfoGrid cols={2} items={[
                {label:tr.name,value:client.name},
                {label:lang==="ar"?"الشركة":"Company",value:client.company},
                {label:lang==="ar"?"المنصب":"Position",value:client.position},
                {label:lang==="ar"?"الجنسية":"Nationality",value:client.nationality},
                {label:tr.phone,value:client.phone},
                {label:tr.email,value:client.email},
                {label:lang==="ar"?"الموقع":"Website",value:client.website},
                {label:tr.address,value:client.address},
              ]}/>
            </Section>
            <Section title={lang==="ar"?"الملخص المالي":"Financial Summary"} icon="💰">
              <InfoGrid cols={1} items={[
                {label:tr.currency,value:client.currency},
                {label:lang==="ar"?"حد الائتمان":"Credit Limit",value:fmt(client.creditLimit||0),color:t.a},
                {label:lang==="ar"?"إجمالي الفواتير":"Total Invoiced",value:fmt(totalInvoiced),color:t.a},
                {label:lang==="ar"?"المدفوع":"Total Paid",value:fmt(totalPaid),color:"#10B981"},
                {label:lang==="ar"?"المستحق":"Outstanding",value:fmt(outstanding),color:outstanding>0?"#EF4444":"#10B981"},
                {label:lang==="ar"?"الفواتير المتأخرة":"Overdue Invoices",value:overdueInvs.length+" "+tr.invoices,color:overdueInvs.length>0?"#EF4444":undefined},
                {label:lang==="ar"?"متوسط وقت الدفع":"Avg Payment Time",value:Math.round(avgPayDays)+" days"},
              ]}/>
            </Section>
          </div>
        )}

        {/* INVOICES */}
        {tab==="invoices"&&(
          <div style={{marginTop:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:13,color:t.tx3,fontWeight:600}}>{cInvs.length} {tr.invoices}</div>
              <div style={{display:"flex",gap:4,background:t.bg3,borderRadius:8,padding:3}}>
                {[{v:"cards",i:"⊞"},{v:"table",i:"☰"}].map(({v,i})=>(
                  <button key={v} onClick={()=>setView(v)} style={{padding:"5px 10px",borderRadius:6,border:"none",background:view===v?t.bg2:"transparent",color:view===v?t.tx:t.tx4,cursor:"pointer",fontSize:13}}>{i}</button>
                ))}
              </div>
            </div>
            {view==="cards"?(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
                {[...cInvs].sort((a,b)=>b.date.localeCompare(a.date)).map(inv=>{
                  const st=invStatus(inv);const bal=calcInvBalance(inv);const tot=calcInvTotal(inv);
                  const sc={Paid:"#10B981",Overdue:"#EF4444",Partial:"#F59E0B",Sent:"#3B82F6",Draft:"#94A3B8"};
                  return(
                    <div key={inv.id} style={{background:t.bg2,borderRadius:14,border:`1px solid ${t.bd}`,padding:16,borderLeft:`3px solid ${sc[st]||t.bd}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                        <span style={{fontWeight:800,color:t.a,fontSize:13}}>{inv.num}</span>
                        <Badge status={st}/>
                      </div>
                      <div style={{fontSize:12,color:t.tx3,marginBottom:8}}>{fmtDate(inv.date)} → {fmtDate(inv.dueDate)}</div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div><div style={{fontSize:10,color:t.tx4}}>{lang==="ar"?"الإجمالي":"Total"}</div><div style={{fontWeight:800,color:t.tx}}>{fmt(tot)}</div></div>
                        {bal>0&&<div style={{textAlign:"right"}}><div style={{fontSize:10,color:t.tx4}}>{lang==="ar"?"المستحق":"Balance"}</div><div style={{fontWeight:700,color:"#EF4444"}}>{fmt(bal)}</div></div>}
                      </div>
                      <div style={{display:"flex",gap:6,marginTop:10}}>
                        <button onClick={()=>openModal("invoice",inv)} style={{flex:1,padding:"6px",borderRadius:8,background:t.bg3,color:t.tx3,border:"none",fontSize:11,cursor:"pointer",fontWeight:600}}>✏ {tr.edit}</button>
                        <button onClick={()=>openModal("recordPayment",inv)} style={{flex:1,padding:"6px",borderRadius:8,background:`${t.a}15`,color:t.a,border:"none",fontSize:11,cursor:"pointer",fontWeight:700}}>💳 {tr.registerPayment}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ):(
              <Card>
                <Table cols={[
                  {key:"num",label:tr.invoiceNum,render:(v,row)=><span style={{fontWeight:700,color:t.a}}>{v}</span>},
                  {key:"date",label:tr.date,render:v=><span style={{color:t.tx3,fontSize:12}}>{fmtDate(v)}</span>},
                  {key:"dueDate",label:tr.dueDate,render:(v,row)=>{const st=invStatus(row);return<span style={{color:st==="Overdue"?"#EF4444":t.tx3,fontSize:12}}>{fmtDate(v)}</span>;}},
                  {key:"_total",label:tr.total,right:true,render:(v,row)=><b>{fmt(calcInvTotal(row))}</b>},
                  {key:"paid",label:tr.paid,right:true,render:v=><span style={{color:"#10B981"}}>{fmt(v||0)}</span>},
                  {key:"_bal",label:tr.balance,right:true,render:(v,row)=>{const b=calcInvBalance(row);return<span style={{fontWeight:700,color:b>0?"#EF4444":"#10B981"}}>{fmt(b)}</span>;}},
                  {key:"status",label:tr.status,render:(v,row)=><Badge status={invStatus(row)}/>},
                ]} rows={[...cInvs].sort((a,b)=>b.date.localeCompare(a.date))}
                actions={row=><Btn size="sm" variant="secondary" onClick={()=>openModal("invoice",row)}>✏</Btn>}/>
              </Card>
            )}
          </div>
        )}

        {/* QUOTES */}
        {tab==="quotes"&&(
          <div style={{marginTop:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:13,color:t.tx3,fontWeight:600}}>{cQuotes.length} {tr.quotes}</div>
              <Btn onClick={()=>openModal("quote",{clientId:client.id,clientName:client.name,clientEmail:client.email,clientAddress:client.address})} variant="primary" icon="＋">{lang==="ar"?"عرض جديد":"New Quote"}</Btn>
            </div>
            {cQuotes.length===0?<EmptyState icon="📋" title={lang==="ar"?"لا توجد عروض أسعار":"No quotes yet"} subtitle={lang==="ar"?"أنشئ عرض سعر لهذا العميل":"Create a quote for this client"}/>:(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
                {[...cQuotes].sort((a,b)=>b.date.localeCompare(a.date)).map(q=>(
                  <div key={q.id} style={{background:t.bg2,borderRadius:14,border:`1px solid ${t.bd}`,padding:16}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                      <span style={{fontWeight:800,color:t.a}}>{q.num}</span>
                      <Badge status={q.status}/>
                    </div>
                    <div style={{fontSize:12,color:t.tx3,marginBottom:6}}>{fmtDate(q.date)} · {lang==="ar"?"صالح حتى":"Valid:"} {fmtDate(q.validUntil)}</div>
                    <div style={{fontSize:16,fontWeight:900,color:t.tx,marginBottom:10}}>{fmt(calcInvTotal(q))}</div>
                    <div style={{display:"flex",gap:6}}>
                      <Btn size="sm" variant="secondary" onClick={()=>openModal("quote",q)} style={{flex:1}}>✏ {tr.edit}</Btn>
                      {!q.convertedToInvoice&&<Btn size="sm" variant="primary" onClick={()=>openModal("convertQuote",q)} style={{flex:1}}>🧾 {tr.convertToInvoice}</Btn>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TRANSACTIONS */}
        {tab==="transactions"&&(
          <div style={{marginTop:16}}>
            <div style={{fontSize:13,color:t.tx3,fontWeight:600,marginBottom:12}}>{cRevs.length} {lang==="ar"?"معاملة":"transactions"}</div>
            {cRevs.length===0?<EmptyState icon="💸" title={lang==="ar"?"لا توجد معاملات":"No transactions"} subtitle={lang==="ar"?"لم يتم تسجيل أي معاملات لهذا العميل":"No revenue records linked to this client"}/>:(
              <Card>
                <Table cols={[
                  {key:"date",label:tr.date,render:v=><span style={{color:t.tx3,fontSize:12}}>{fmtDate(v)}</span>},
                  {key:"description",label:tr.description,render:v=><span style={{color:t.tx,fontWeight:600}}>{v}</span>},
                  {key:"cat",label:tr.category,render:v=><span style={{color:t.tx3,fontSize:12}}>{v}</span>},
                  {key:"amount",label:tr.amount,right:true,render:v=><b style={{color:"#10B981"}}>{fmt(v)}</b>},
                  {key:"payMethod",label:lang==="ar"?"الدفع":"Method",render:v=><span style={{color:t.tx4,fontSize:12}}>{v}</span>},
                  {key:"ref",label:tr.ref,render:v=><span style={{color:t.tx4,fontSize:11}}>{v}</span>},
                ]} rows={[...cRevs].sort((a,b)=>b.date.localeCompare(a.date))}/>
              </Card>
            )}
          </div>
        )}

        {/* STATEMENT */}
        {tab==="statement"&&(
          <div style={{marginTop:16}}>
            <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginBottom:12}}>
              <Btn variant="ghost" icon="🖨" onClick={()=>window.print()}>{tr.print}</Btn>
              <Btn variant="primary" icon="📄" onClick={exportStatement}>{lang==="ar"?"تصدير":"Export"}</Btn>
            </div>
            <div style={{background:t.bg2,borderRadius:16,padding:28,border:`1px solid ${t.bd}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
                <div><div style={{fontSize:20,fontWeight:900,color:t.tx,marginBottom:3}}>{lang==="ar"?"كشف حساب العميل":"CLIENT STATEMENT"}</div><div style={{fontSize:12,color:t.tx3}}>{lang==="ar"?"بتاريخ":"As of"} {fmtDate(today())}</div></div>
                <div style={{textAlign:"right"}}><div style={{fontWeight:700,color:t.tx}}>{client.name}</div><div style={{fontSize:12,color:t.tx4}}>{client.company}</div></div>
              </div>
              <table style={{width:"100%",borderCollapse:"collapse",marginBottom:16,fontSize:12}}>
                <thead><tr style={{background:t.bg3}}>{[lang==="ar"?"التاريخ":"Date",lang==="ar"?"المرجع":"Ref",lang==="ar"?"البيان":"Description",lang==="ar"?"مدين":"Debit",lang==="ar"?"دائن":"Credit",lang==="ar"?"الرصيد":"Balance"].map((h,i)=>(
                  <th key={i} style={{padding:"8px 10px",textAlign:i>2?"right":"left",fontWeight:700,color:t.tx3,borderBottom:`2px solid ${t.bd}`,fontSize:10}}>{h}</th>
                ))}</tr></thead>
                <tbody>
                  {[...cInvs].sort((a,b)=>a.date.localeCompare(b.date)).map((inv,i,arr)=>{
                    const total=calcInvTotal(inv);
                    const runBal=arr.slice(0,i+1).reduce((s,x)=>s+calcInvTotal(x)-(x.paid||0),0);
                    return(
                      <React.Fragment key={inv.id}>
                        <tr style={{borderBottom:`1px solid ${t.bd}`}}>
                          <td style={{padding:"7px 10px",color:t.tx3,fontSize:11}}>{fmtDate(inv.date)}</td>
                          <td style={{padding:"7px 10px",fontWeight:600,color:t.a}}>{inv.num}</td>
                          <td style={{padding:"7px 10px",color:t.tx}}>{lang==="ar"?"فاتورة":"Invoice"}</td>
                          <td style={{padding:"7px 10px",textAlign:"right",fontWeight:700}}>{fmt(total)}</td>
                          <td style={{padding:"7px 10px",textAlign:"right",color:t.tx4}}>—</td>
                          <td style={{padding:"7px 10px",textAlign:"right",fontWeight:700,color:runBal>0?"#EF4444":"#10B981"}}>{fmt(runBal)}</td>
                        </tr>
                        {inv.paid>0&&<tr style={{borderBottom:`1px solid ${t.bd}`,background:t.bg3+"60"}}>
                          <td style={{padding:"7px 10px",color:t.tx3,fontSize:11}}>{fmtDate(inv.paidDate)}</td>
                          <td style={{padding:"7px 10px",color:t.tx4,fontSize:11}}>{inv.payRef||"—"}</td>
                          <td style={{padding:"7px 10px",color:"#10B981"}}>{lang==="ar"?"دفعة مستلمة":"Payment Received"} ({inv.payMethod})</td>
                          <td style={{padding:"7px 10px",textAlign:"right",color:t.tx4}}>—</td>
                          <td style={{padding:"7px 10px",textAlign:"right",color:"#10B981",fontWeight:700}}>{fmt(inv.paid)}</td>
                          <td style={{padding:"7px 10px",textAlign:"right"}}/>
                        </tr>}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
              <div style={{display:"flex",justifyContent:"flex-end"}}>
                <div style={{width:240}}>
                  {[[lang==="ar"?"إجمالي الفواتير":"Total Invoiced",fmt(totalInvoiced)],[lang==="ar"?"المدفوع":"Total Paid",fmt(totalPaid)]].map(([l,v],i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${t.bd}`}}>
                      <span style={{color:t.tx3,fontSize:12}}>{l}</span><span style={{fontWeight:700}}>{v}</span>
                    </div>
                  ))}
                  <div style={{display:"flex",justifyContent:"space-between",padding:"10px 12px",background:outstanding>0?"#EF444420":"#10B98120",borderRadius:8,marginTop:6}}>
                    <span style={{fontWeight:800,color:t.tx,fontSize:12}}>{lang==="ar"?"الرصيد المستحق":"BALANCE DUE"}</span>
                    <span style={{fontWeight:900,fontSize:16,color:outstanding>0?"#EF4444":"#10B981"}}>{fmt(outstanding)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NOTES */}
        {tab==="notes"&&(
          <div style={{marginTop:16,maxWidth:680}}>
            <div style={{marginBottom:16}}>
              <textarea value={noteText} onChange={e=>setNoteText(e.target.value)}
                placeholder={lang==="ar"?"اكتب ملاحظة...":"Write a note..."}
                style={{width:"100%",padding:"12px 14px",borderRadius:10,border:`1.5px solid ${t.bd}`,background:t.bg3,color:t.tx,fontSize:13,resize:"vertical",minHeight:80,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}
                onFocus={e=>e.target.style.borderColor=t.a} onBlur={e=>e.target.style.borderColor=t.bd}
                onKeyDown={e=>{if(e.key==="Enter"&&e.ctrlKey)saveNote();}}
              />
              <div style={{display:"flex",justifyContent:"flex-end",marginTop:6}}>
                <Btn onClick={saveNote} variant="primary" icon="💾">{lang==="ar"?"حفظ الملاحظة":"Save Note"} (Ctrl+Enter)</Btn>
              </div>
            </div>
            {notes.length===0?<EmptyState icon="📝" title={lang==="ar"?"لا توجد ملاحظات":"No notes yet"} subtitle={lang==="ar"?"أضف ملاحظاتك أو تعليقاتك":"Add notes about this client"}/>:(
              notes.map(n=>(
                <div key={n.id} style={{background:t.bg2,borderRadius:12,padding:"14px 16px",marginBottom:8,border:`1px solid ${t.bd}`,position:"relative"}}>
                  <div style={{fontSize:13,color:t.tx,lineHeight:1.6,marginBottom:6,whiteSpace:"pre-wrap"}}>{n.text}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:11,color:t.tx4}}>📅 {fmtDate(n.date)} · {n.author}</span>
                    <button onClick={()=>deleteNote(n.id)} style={{background:"none",border:"none",color:t.tx4,cursor:"pointer",fontSize:16,padding:"2px 6px",borderRadius:6}}>×</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* CRM */}
        {tab==="crm"&&(
          <div style={{marginTop:16}}>
            {cLeads.length===0?(
              <EmptyState icon="🤝" title={lang==="ar"?"لا يوجد نشاط":"No CRM activity"} subtitle="" action={<Btn onClick={()=>openModal("crmLead",{email:client.email,company:client.company,name:client.name})} variant="primary">{lang==="ar"?"إضافة صفقة":"Add to Pipeline"}</Btn>}/>
            ):(
              cLeads.map(lead=>(
                <div key={lead.id} style={{background:t.bg3,borderRadius:12,padding:16,marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <div style={{fontWeight:700,color:t.tx}}>{lead.company}</div><Badge status={lead.stage}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,fontSize:12}}>
                    <div><span style={{color:t.tx4}}>{lang==="ar"?"قيمة الصفقة":"Deal: "}</span><b style={{color:t.a}}>{fmt(lead.dealValue)}</b></div>
                    <div><span style={{color:t.tx4}}>{lang==="ar"?"الاحتمالية":"Prob: "}</span><b>{lead.probability}%</b></div>
                    <div><span style={{color:t.tx4}}>{lang==="ar"?"المسؤول":"Assigned: "}</span><span>{lead.assignedTo}</span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {tab==="documents"&&(
          <div style={{marginTop:16,maxWidth:760}}>
            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"flex-end"}}>
              <div style={{flex:1,minWidth:200}}>
                <div style={{fontSize:11,fontWeight:700,color:t.tx4,marginBottom:4,textTransform:"uppercase"}}>{lang==="ar"?"اسم المستند":"Document Name"}</div>
                <input value={docName} onChange={e=>setDocName(e.target.value)} placeholder={lang==="ar"?"اسم الملف أو المستند...":"File name or document..."}
                  style={{width:"100%",padding:"9px 12px",borderRadius:10,border:`1.5px solid ${t.bd}`,background:t.bg3,color:t.tx,fontSize:13,outline:"none",fontFamily:"inherit"}}
                  onFocus={e=>e.target.style.borderColor=t.a} onBlur={e=>e.target.style.borderColor=t.bd}
                  onKeyDown={e=>{if(e.key==="Enter")addDoc();}}/>
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:t.tx4,marginBottom:4,textTransform:"uppercase"}}>{lang==="ar"?"النوع":"Type"}</div>
                <select value={docType} onChange={e=>setDocType(e.target.value)} style={{padding:"9px 12px",borderRadius:10,border:`1.5px solid ${t.bd}`,background:t.bg3,color:t.tx,fontSize:13,outline:"none"}}>
                  {(lang==="ar"?["عقد","فاتورة","عرض سعر","رخصة","معلومات بنكية","اتفاقية","مراسلة","أخرى"]:["Contract","Invoice","Quote","License","Bank Details","Agreement","Correspondence","Other"]).map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <Btn onClick={addDoc} variant="primary" icon="＋">{lang==="ar"?"إضافة":"Add"}</Btn>
            </div>
            {docs.length===0?(
              <EmptyState icon="📁" title={lang==="ar"?"لا توجد مستندات":"No documents yet"} subtitle={lang==="ar"?"أضف مستندات ووثائق متعلقة بالعميل":"Add files and documents related to this client"}/>
            ):(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
                {docs.map(doc=>{
                  const docIcons={Contract:"📝",Invoice:"🧾",Quote:"📋",License:"📜",Agreement:"🤝",Correspondence:"✉",Other:"📄",عقد:"📝",فاتورة:"🧾","عرض سعر":"📋",رخصة:"📜","معلومات بنكية":"🏦",اتفاقية:"🤝",مراسلة:"✉",أخرى:"📄"};
                  return(
                    <div key={doc.id} style={{background:t.bg2,borderRadius:14,border:`1px solid ${t.bd}`,padding:"14px 16px",display:"flex",gap:12,alignItems:"flex-start",transition:"box-shadow .15s"}}
                      onMouseEnter={e=>e.currentTarget.style.boxShadow=t.sh2}
                      onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                      <div style={{width:40,height:40,borderRadius:10,background:`${t.a}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{docIcons[doc.type]||"📄"}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,color:t.tx,fontSize:13,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{doc.name}</div>
                        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                          <span style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:`${t.a}15`,color:t.a,fontWeight:700}}>{doc.type}</span>
                          <span style={{fontSize:10,color:t.tx4}}>{fmtDate(doc.date)}</span>
                        </div>
                      </div>
                      <button onClick={()=>delDoc(doc.id)} style={{background:"none",border:"none",color:t.tx4,cursor:"pointer",fontSize:16,padding:"2px 4px",flexShrink:0,borderRadius:6,transition:"color .1s"}}
                        onMouseEnter={e=>e.currentTarget.style.color="#EF4444"} onMouseLeave={e=>e.currentTarget.style.color=t.tx4}>×</button>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{marginTop:16,padding:"10px 14px",background:t.bg3,borderRadius:10,fontSize:11,color:t.tx4}}>
              💡 {lang==="ar"?"يمكنك تسجيل أسماء المستندات والوثائق المرتبطة بهذا العميل هنا. لتحميل الملفات الفعلية استخدم مساحة التخزين الخاصة بك.":"You can log document names and reference files here. For actual file storage, use your cloud storage."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CLIENTS LIST PAGE ───────────────────────────────────────
// ─── CLIENTS LIST PAGE ───────────────────────────────────────
function ClientsPage(){
  const {t,tr,fmt,cC,setClis,cI,openModal,lang}=useApp();
  const [search,setSearch]=React.useState("");
  const [selectedClient,setSelectedClient]=React.useState(null);
  const [view,setView]=React.useState("cards");
  const [filterTag,setFilterTag]=React.useState("");
  const [sortBy,setSortBy]=React.useState("name");

  if(selectedClient)return<ClientProfile client={selectedClient} onBack={()=>setSelectedClient(null)}/>;

  const allTags=[...new Set(cC.flatMap(c=>c.tags||[]))];

  const filtered=React.useMemo(()=>{
    let list=cC.filter(c=>{
      const s=search.toLowerCase();
      const matchSearch=!s||(c.name||"").toLowerCase().includes(s)||(c.company||"").toLowerCase().includes(s)||(c.email||"").toLowerCase().includes(s)||(c.phone||"").toLowerCase().includes(s);
      const matchTag=!filterTag||(c.tags||[]).includes(filterTag);
      return matchSearch&&matchTag;
    });
    if(sortBy==="name")list=[...list].sort((a,b)=>a.name.localeCompare(b.name));
    else if(sortBy==="company")list=[...list].sort((a,b)=>(a.company||"").localeCompare(b.company||""));
    else if(sortBy==="outstanding")list=[...list].sort((a,b)=>{
      const bA=cI.filter(i=>i.clientId===b.id).reduce((s,i)=>s+calcInvBalance(i),0);
      const bC=cI.filter(i=>i.clientId===a.id).reduce((s,i)=>s+calcInvBalance(i),0);
      return bA-bC;
    });
    return list;
  },[cC,cI,search,filterTag,sortBy]);

  const totalOutstanding=cC.reduce((sum,c)=>{
    const cinvs=cI.filter(i=>i.clientId===c.id);
    return sum+cinvs.reduce((s,i)=>s+calcInvBalance(i),0);
  },0);

  return(
    <div style={{padding:24}}>
      <PageHeader title={tr.clients} icon="👥" subtitle={`${cC.length} ${lang==="ar"?"عميل":"clients"} · ${lang==="ar"?"المستحق":"Outstanding"}: ${fmt(totalOutstanding)}`}
        actions={<Btn onClick={()=>openModal("client",{})} variant="primary" icon="＋">{lang==="ar"?"إضافة عميل":"Add Client"}</Btn>}
      />
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{flex:1,minWidth:220}}><SearchBar value={search} onChange={setSearch} placeholder={lang==="ar"?"بحث عن عميل...":"Search clients..."}/></div>
        {allTags.length>0&&(
          <select value={filterTag} onChange={e=>setFilterTag(e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:`1px solid ${t.bd}`,background:t.bg3,color:t.tx,fontSize:12,outline:"none"}}>
            <option value="">{lang==="ar"?"كل التصنيفات":"All Tags"}</option>
            {allTags.map(tag=><option key={tag} value={tag}>{tag}</option>)}
          </select>
        )}
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:`1px solid ${t.bd}`,background:t.bg3,color:t.tx,fontSize:12,outline:"none"}}>
          <option value="name">{lang==="ar"?"ترتيب: الاسم":"Sort: Name"}</option>
          <option value="company">{lang==="ar"?"ترتيب: الشركة":"Sort: Company"}</option>
          <option value="outstanding">{lang==="ar"?"ترتيب: المستحق":"Sort: Outstanding"}</option>
        </select>
        <div style={{display:"flex",gap:2,background:t.bg3,borderRadius:8,padding:3}}>
          {[{v:"cards",i:"⊞"},{v:"table",i:"☰"}].map(({v,i})=>(
            <button key={v} onClick={()=>setView(v)} style={{padding:"6px 12px",borderRadius:6,border:"none",background:view===v?t.bg2:"transparent",color:view===v?t.tx:t.tx4,cursor:"pointer",fontSize:13,fontWeight:600}}>{i}</button>
          ))}
        </div>
      </div>

      {filtered.length===0&&<EmptyState icon="👥" title={lang==="ar"?"لا توجد نتائج":"No clients found"} subtitle={lang==="ar"?"جرب بحثًا مختلفًا":"Try a different search"}/>}

      {view==="cards"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
          {filtered.map(client=>{
            const cInvs=cI.filter(i=>i.clientId===client.id);
            const outstanding=cInvs.reduce((s,i)=>s+calcInvBalance(i),0);
            const overdue=cInvs.filter(i=>invStatus(i)==="Overdue").length;
            return(
              <div key={client.id} onClick={()=>setSelectedClient(client)}
                style={{background:t.bg2,borderRadius:16,border:`1px solid ${t.bd}`,padding:20,cursor:"pointer",transition:"all .15s",boxShadow:t.sh}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.borderColor=t.a;e.currentTarget.style.boxShadow=t.sh2;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor=t.bd;e.currentTarget.style.boxShadow=t.sh;}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:12}}>
                  <Avatar name={client.name} photo={client.photo} size={44}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:800,color:t.tx,marginBottom:1}}>{client.name}</div>
                    <div style={{fontSize:12,color:t.tx3}}>{client.company}</div>
                    <div style={{fontSize:11,color:t.tx4}}>{client.position}</div>
                  </div>
                  {overdue>0&&<Badge status="Overdue"/>}
                </div>
                {client.tags?.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                  {client.tags.map((tag,i)=><span key={i} style={{padding:"2px 7px",borderRadius:20,background:`${t.a}15`,color:t.a,fontSize:10,fontWeight:700}}>{tag}</span>)}
                </div>}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
                  <div style={{background:t.bg3,borderRadius:8,padding:"7px 9px"}}>
                    <div style={{fontSize:10,color:t.tx4}}>{lang==="ar"?"المستحق":"Outstanding"}</div>
                    <div style={{fontSize:12,fontWeight:700,color:outstanding>0?"#EF4444":"#10B981"}}>{fmt(outstanding)}</div>
                  </div>
                  <div style={{background:t.bg3,borderRadius:8,padding:"7px 9px"}}>
                    <div style={{fontSize:10,color:t.tx4}}>{lang==="ar"?"الفواتير":"Invoices"}</div>
                    <div style={{fontSize:12,fontWeight:700,color:t.tx}}>{cInvs.length}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:5}}>
                  {client.phone&&<a href={`tel:${client.phone}`} onClick={e=>e.stopPropagation()} style={{flex:1,padding:"5px",borderRadius:7,background:t.bg3,color:t.tx3,fontSize:10,textAlign:"center",textDecoration:"none",fontWeight:600}}>📞</a>}
                  {client.email&&<a href={`mailto:${client.email}`} onClick={e=>e.stopPropagation()} style={{flex:1,padding:"5px",borderRadius:7,background:t.bg3,color:t.tx3,fontSize:10,textAlign:"center",textDecoration:"none",fontWeight:600}}>✉</a>}
                  <button onClick={e=>{e.stopPropagation();openModal("invoice",{clientId:client.id,clientName:client.name,clientEmail:client.email,clientAddress:client.address});}} style={{flex:1,padding:"5px",borderRadius:7,background:`${t.a}15`,color:t.a,border:"none",fontSize:10,cursor:"pointer",fontWeight:700}}>🧾</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view==="table"&&(
        <Card>
          <Table cols={[
            {key:"name",label:tr.name,render:(v,row)=><div style={{display:"flex",gap:10,alignItems:"center",cursor:"pointer"}} onClick={()=>setSelectedClient(row)}><Avatar name={v} size={32}/><div><div style={{fontWeight:700,color:t.a}}>{v}</div><div style={{fontSize:11,color:t.tx4}}>{row.company}</div></div></div>},
            {key:"phone",label:tr.phone,render:v=>v?<a href={`tel:${v}`} style={{color:t.a,textDecoration:"none",fontSize:12}}>{v}</a>:null},
            {key:"email",label:tr.email,render:v=>v?<a href={`mailto:${v}`} style={{color:t.a,textDecoration:"none",fontSize:12}}>{v}</a>:null},
            {key:"currency",label:tr.currency,render:v=><span style={{color:t.tx3,fontSize:12}}>{v}</span>},
            {key:"_outstanding",label:lang==="ar"?"المستحق":"Outstanding",right:true,render:(v,row)=>{
              const bal=cI.filter(i=>i.clientId===row.id).reduce((s,i)=>s+calcInvBalance(i),0);
              return<span style={{fontWeight:700,color:bal>0?"#EF4444":"#10B981"}}>{fmt(bal)}</span>;
            }},
            {key:"_invs",label:lang==="ar"?"الفواتير":"Invoices",center:true,render:(v,row)=><span style={{fontWeight:600,color:t.tx3}}>{cI.filter(i=>i.clientId===row.id).length}</span>},
          ]} rows={filtered}
          actions={row=>(
            <div style={{display:"flex",gap:4}}>
              <Btn size="sm" variant="secondary" onClick={()=>setSelectedClient(row)}>👤</Btn>
              <Btn size="sm" variant="secondary" onClick={()=>openModal("client",row)}>✏</Btn>
            </div>
          )}/>
        </Card>
      )}
    </div>
  );
}

// ─── CRM PIPELINE PAGE ───────────────────────────────────────
function CRMPage(){
  const {t,tr,fmt,cCRM,setCRM,cW,openModal}=useApp();
  const [view,setView]=React.useState("kanban");
  const stages=["Lead","Qualified","Proposal","Negotiation","Won","Lost"];
  const stageColors={Lead:"#64748B",Qualified:"#3B82F6",Proposal:"#8B5CF6",Negotiation:"#F97316",Won:"#10B981",Lost:"#EF4444"};
  const weightedPipeline=cCRM.filter(l=>!["Won","Lost"].includes(l.stage)).reduce((s,l)=>s+l.dealValue*(l.probability/100),0);
  const totalPipeline=cCRM.filter(l=>!["Won","Lost"].includes(l.stage)).reduce((s,l)=>s+l.dealValue,0);

  return(
    <div style={{padding:24}}>
      <PageHeader title="CRM & Sales Pipeline" icon="🎯" subtitle={`${cCRM.length} deals · Pipeline: ${fmt(totalPipeline)} · Weighted: ${fmt(Math.round(weightedPipeline))}`}
        actions={<>
          <div style={{display:"flex",gap:2,background:t.bg3,borderRadius:8,padding:3}}>
            {["kanban","table"].map(v=><button key={v} onClick={()=>setView(v)} style={{padding:"6px 14px",borderRadius:6,border:"none",background:view===v?t.bg2:"transparent",color:view===v?t.tx:t.tx3,cursor:"pointer",fontSize:12,fontWeight:600}}>{v==="kanban"?"🗂 Kanban":"📋 Table"}</button>)}
          </div>
          <Btn onClick={()=>openModal("crmLead",{})} variant="primary" icon="＋">Add Deal</Btn>
        </>}
      />

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10,marginBottom:20}}>
        {stages.map(stage=>{
          const leads=cCRM.filter(l=>l.stage===stage);
          const val=leads.reduce((s,l)=>s+l.dealValue,0);
          return(
            <div key={stage} style={{background:t.bg2,borderRadius:12,padding:"12px 14px",border:`1px solid ${t.bd}`,borderTop:`3px solid ${stageColors[stage]}`}}>
              <div style={{fontSize:10,fontWeight:700,color:stageColors[stage],letterSpacing:.5,marginBottom:4}}>{stage.toUpperCase()}</div>
              <div style={{fontSize:16,fontWeight:800,color:t.tx}}>{leads.length}</div>
              <div style={{fontSize:11,color:t.tx4}}>{fmt(val)}</div>
            </div>
          );
        })}
      </div>

      {view==="kanban"&&(
        <div style={{display:"grid",gridTemplateColumns:`repeat(${stages.length},minmax(220px,1fr))`,gap:12,overflowX:"auto"}}>
          {stages.map(stage=>{
            const leads=cCRM.filter(l=>l.stage===stage);
            return(
              <div key={stage} style={{minWidth:220}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,padding:"8px 12px",background:t.bg2,borderRadius:10,border:`1px solid ${t.bd}`,borderTop:`3px solid ${stageColors[stage]}`}}>
                  <span style={{fontWeight:700,color:t.tx,fontSize:13}}>{stage}</span>
                  <span style={{background:stageColors[stage]+"25",color:stageColors[stage],padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700}}>{leads.length}</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {leads.map(lead=>(
                    <div key={lead.id} style={{background:t.bg2,borderRadius:12,padding:14,border:`1px solid ${t.bd}`,cursor:"pointer",transition:"all .15s"}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=stageColors[stage];e.currentTarget.style.boxShadow=t.sh;}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=t.bd;e.currentTarget.style.boxShadow="none";}}>
                      <div style={{fontWeight:700,color:t.tx,marginBottom:2,fontSize:13}}>{lead.company}</div>
                      <div style={{fontSize:11,color:t.tx3,marginBottom:8}}>{lead.name}</div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <span style={{fontWeight:700,color:stageColors[stage],fontSize:13}}>{fmt(lead.dealValue)}</span>
                        <span style={{fontSize:11,color:t.tx4}}>{lead.probability}% prob</span>
                      </div>
                      <ProgressBar value={lead.probability} max={100} color={stageColors[stage]} height={4}/>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
                        <span style={{fontSize:10,color:t.tx4}}>👤 {lead.assignedTo}</span>
                        <span style={{fontSize:10,color:lead.nextFollowUp&&lead.nextFollowUp<today()?"#EF4444":t.tx4}}>
                          📅 {fmtDateShort(lead.nextFollowUp)}
                        </span>
                      </div>
                      <div style={{display:"flex",gap:4,marginTop:8}}>
                        {["Won","Lost"].map(s=>(
                          <button key={s} onClick={e=>{e.stopPropagation();setCRM(p=>p.map(x=>x.id===lead.id?{...x,stage:s}:x));}} style={{flex:1,padding:"4px",borderRadius:6,border:"none",background:s==="Won"?"#10B98120":"#EF444420",color:s==="Won"?"#10B981":"#EF4444",cursor:"pointer",fontSize:11,fontWeight:700}}>{s==="Won"?"✓ Won":"✗ Lost"}</button>
                        ))}
                        <button onClick={e=>{e.stopPropagation();openModal("crmLead",lead);}} style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${t.bd}`,background:"transparent",color:t.tx3,cursor:"pointer",fontSize:11}}>✏</button>
                      </div>
                    </div>
                  ))}
                  <button onClick={()=>openModal("crmLead",{stage})} style={{padding:"10px",borderRadius:10,border:`2px dashed ${t.bd}`,background:"transparent",color:t.tx4,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>＋ Add Deal</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view==="table"&&(
        <Card>
          <Table
            cols={[
              {key:"company",label:"Company",render:(v,row)=><div><div style={{fontWeight:700,color:t.tx}}>{v}</div><div style={{fontSize:11,color:t.tx4}}>{row.name}</div></div>},
              {key:"stage",label:"Stage",render:v=><Badge status={v}/>},
              {key:"dealValue",label:"Deal Value",right:true,render:v=><b style={{color:t.a}}>{fmt(v)}</b>},
              {key:"probability",label:"Prob %",center:true,render:v=><span style={{fontWeight:700}}>{v}%</span>},
              {key:"_weighted",label:"Weighted",right:true,render:(v,row)=><span style={{color:t.tx3}}>{fmt(row.dealValue*row.probability/100)}</span>},
              {key:"assignedTo",label:"Assigned To"},
              {key:"nextFollowUp",label:"Follow Up",render:v=><span style={{color:v&&v<today()?"#EF4444":t.tx3,fontSize:12}}>{fmtDate(v)}</span>},
              {key:"source",label:"Source",render:v=><span style={{color:t.tx4,fontSize:12}}>{v}</span>},
            ]}
            rows={cCRM}
            actions={row=>(
              <div style={{display:"flex",gap:4}}>
                <Btn size="sm" variant="secondary" onClick={()=>openModal("crmLead",row)}>✏</Btn>
                <Btn size="sm" variant="danger" onClick={()=>setCRM(p=>p.filter(x=>x.id!==row.id))}>×</Btn>
              </div>
            )}
          />
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  MASHRO3Y v7.0 — INVOICES, QUOTES, REVENUE, EXPENSES
// ═══════════════════════════════════════════════════════════

// ─── INVOICE PRINT VIEW ──────────────────────────────────────
function InvoicePrintView({inv,co,fmt}){
  const {t}=useApp();
  const total=calcInvTotal(inv);
  const subtotal=inv.lines?.reduce((s,l)=>s+calcLine(l).taxable,0)||0;
  const taxTotal=inv.lines?.reduce((s,l)=>s+calcLine(l).tax,0)||0;
  const balance=calcInvBalance(inv);
  return(
    <div id="inv-print" style={{background:"#fff",color:"#111",padding:40,maxWidth:780,margin:"0 auto",fontFamily:"Arial,sans-serif"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:36}}>
        <div>
          <div style={{width:52,height:52,borderRadius:14,background:co?.color||"#3B82F6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:900,color:"#fff",marginBottom:12}}>{co?.logo||"M"}</div>
          <div style={{fontSize:20,fontWeight:900,color:"#0D1117"}}>{co?.name}</div>
          {co?.address&&<div style={{fontSize:12,color:"#555",marginTop:4}}>{co.address}</div>}
          {co?.taxNum&&<div style={{fontSize:12,color:"#555"}}>Tax/VAT: {co.taxNum}</div>}
          {co?.phone&&<div style={{fontSize:12,color:"#555"}}>{co.phone}</div>}
          {co?.email&&<div style={{fontSize:12,color:"#555"}}>{co.email}</div>}
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:32,fontWeight:900,color:co?.color||"#3B82F6",marginBottom:8}}>INVOICE</div>
          <div style={{fontSize:16,fontWeight:700,color:"#0D1117",marginBottom:8}}>{inv.num}</div>
          <table style={{fontSize:12,color:"#555",marginLeft:"auto"}}>
            <tbody>
              <tr><td style={{paddingRight:16,textAlign:"right",color:"#888"}}>Issue Date:</td><td style={{fontWeight:600}}>{fmtDate(inv.date)}</td></tr>
              <tr><td style={{textAlign:"right",color:"#888"}}>Due Date:</td><td style={{fontWeight:600,color:invStatus(inv)==="Overdue"?"#EF4444":"#0D1117"}}>{fmtDate(inv.dueDate)}</td></tr>
              <tr><td style={{textAlign:"right",color:"#888"}}>Terms:</td><td>{inv.payTerms}</td></tr>
              <tr><td style={{textAlign:"right",color:"#888"}}>Currency:</td><td>{inv.currency}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* Bill To */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:40,marginBottom:32,padding:"20px 24px",background:"#F8FAFF",borderRadius:12}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,color:"#888",letterSpacing:1,marginBottom:8}}>BILL TO</div>
          <div style={{fontSize:16,fontWeight:700,color:"#0D1117"}}>{inv.clientName}</div>
          {inv.clientAddress&&<div style={{fontSize:12,color:"#555",marginTop:4}}>{inv.clientAddress}</div>}
          {inv.clientEmail&&<div style={{fontSize:12,color:"#555"}}>{inv.clientEmail}</div>}
        </div>
        {inv.notes&&<div>
          <div style={{fontSize:10,fontWeight:700,color:"#888",letterSpacing:1,marginBottom:8}}>NOTES</div>
          <div style={{fontSize:12,color:"#555",lineHeight:1.6}}>{inv.notes}</div>
        </div>}
      </div>
      {/* Line Items */}
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:28}}>
        <thead>
          <tr style={{background:co?.color||"#3B82F6"}}>
            {["#","Description","Qty","Unit Price","Discount","Tax","Total"].map((h,i)=>(
              <th key={i} style={{padding:"10px 14px",textAlign:i>1?"right":"left",color:"#fff",fontWeight:700,fontSize:12}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {inv.lines?.map((line,i)=>{
            const c=calcLine(line);
            return(
              <tr key={i} style={{borderBottom:"1px solid #E5E7EB",background:i%2===0?"#fff":"#FAFAFA"}}>
                <td style={{padding:"12px 14px",color:"#888",fontSize:12}}>{i+1}</td>
                <td style={{padding:"12px 14px",fontWeight:500,color:"#111"}}>{line.desc}</td>
                <td style={{padding:"12px 14px",textAlign:"right"}}>{line.qty}</td>
                <td style={{padding:"12px 14px",textAlign:"right"}}>{fmtNum(line.price,2)}</td>
                <td style={{padding:"12px 14px",textAlign:"right",color:line.discount?"#F59E0B":"#888"}}>{line.discount?line.discount+"%":"—"}</td>
                <td style={{padding:"12px 14px",textAlign:"right",color:"#888"}}>{line.tax?line.tax+"%":"—"}</td>
                <td style={{padding:"12px 14px",textAlign:"right",fontWeight:700}}>{fmtNum(c.total,2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Totals */}
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:32}}>
        <div style={{width:280}}>
          {[["Subtotal",fmtNum(subtotal,2)],["Tax",fmtNum(taxTotal,2)]].map(([l,v],i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #E5E7EB"}}>
              <span style={{color:"#555",fontSize:13}}>{l}</span><span style={{fontWeight:600,fontSize:13}}>{v}</span>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",padding:"14px 16px",background:co?.color||"#3B82F6",borderRadius:10,marginTop:8}}>
            <span style={{fontWeight:800,color:"#fff",fontSize:14}}>TOTAL</span>
            <span style={{fontWeight:900,color:"#fff",fontSize:20}}>{fmtNum(total,2)} {inv.currency}</span>
          </div>
          {inv.paid>0&&<>
            <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0"}}>
              <span style={{color:"#10B981",fontWeight:600}}>Amount Paid</span><span style={{color:"#10B981",fontWeight:700}}>- {fmtNum(inv.paid,2)}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"12px 16px",background:balance>0?"#FEF2F2":"#F0FDF4",borderRadius:10,border:`2px solid ${balance>0?"#EF4444":"#10B981"}`}}>
              <span style={{fontWeight:800,color:balance>0?"#EF4444":"#10B981"}}>BALANCE DUE</span>
              <span style={{fontWeight:900,fontSize:18,color:balance>0?"#EF4444":"#10B981"}}>{fmtNum(balance,2)} {inv.currency}</span>
            </div>
          </>}
        </div>
      </div>
      {/* Footer */}
      {co?.invoicePayInstructions&&(
        <div style={{marginBottom:16,padding:"12px 16px",background:"#F0FDF4",borderRadius:8,border:"1px solid #BBF7D0"}}>
          <div style={{fontSize:10,fontWeight:700,color:"#166534",marginBottom:4,letterSpacing:.5}}>PAYMENT INSTRUCTIONS</div>
          <div style={{fontSize:12,color:"#166534",whiteSpace:"pre-wrap"}}>{co.invoicePayInstructions}</div>
        </div>
      )}
      {co?.bankIBAN&&(
        <div style={{marginBottom:16,padding:"12px 16px",background:"#EFF6FF",borderRadius:8}}>
          <div style={{fontSize:10,fontWeight:700,color:"#1d4ed8",marginBottom:4,letterSpacing:.5}}>BANK DETAILS</div>
          <div style={{fontSize:12,color:"#1e3a5f"}}>{co.bankName&&`${co.bankName} · `}IBAN: {co.bankIBAN}{co.bankSwift&&` · SWIFT: ${co.bankSwift}`}</div>
        </div>
      )}
      <div style={{borderTop:"1px solid #E5E7EB",paddingTop:16,display:"flex",justifyContent:"space-between",fontSize:11,color:"#888"}}>
        <span>{co?.invoiceFooter||"Thank you for your business!"}</span>
        <span>{co?.email||""} · {co?.phone||""} · {co?.website||""}</span>
      </div>
    </div>
  );
}

// ─── INVOICE DETAIL ──────────────────────────────────────────
function InvoiceDetail({inv,onBack}){
  const {t,tr,fmt,companies,acId,setInvs,setRevs,openModal,showToast}=useApp();
  const co=companies.find(c=>c.id===acId)||companies[0]||{};
  const st=invStatus(inv);
  const total=calcInvTotal(inv);
  const balance=calcInvBalance(inv);

  const printInv=()=>{
    const w=window.open("","_blank");
    const el=document.getElementById("inv-print");
    w.document.write(`<!DOCTYPE html><html><head><title>${inv.num}</title><style>*{box-sizing:border-box;}body{margin:0;padding:0;}</style></head><body>`);
    w.document.write(el.outerHTML);
    w.document.write("</body></html>");
    w.document.close();w.print();
  };

  const sendEmail=()=>{
    const subject=`Invoice ${inv.num} from ${co.name}`;
    const body=`Dear ${inv.clientName},\n\nPlease find attached Invoice ${inv.num} for ${fmt(total)}.\n\nDue Date: ${fmtDate(inv.dueDate)}\n\nThank you,\n${co.name}`;
    window.location.href=`mailto:${inv.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return(
    <div style={{minHeight:"100vh",background:t.bg}}>
      <div style={{background:t.bg2,borderBottom:`1px solid ${t.bd}`,padding:"16px 24px",display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:t.tx3,cursor:"pointer",fontSize:13,fontWeight:600}}>← Invoices</button>
        <div style={{flex:1}}/>
        <Badge status={st} size="md"/>
        {balance>0&&<span style={{fontSize:14,fontWeight:700,color:"#EF4444"}}>Balance: {fmt(balance)}</span>}
        <div style={{display:"flex",gap:8}}>
          {st!=="Paid"&&st!=="Cancelled"&&<Btn onClick={()=>openModal("payment",inv)} variant="success" icon="💰">Register Payment</Btn>}
          {st==="Draft"&&<Btn onClick={()=>{setInvs(p=>p.map(x=>x.id===inv.id?{...x,status:"Sent"}:x));onBack();}} variant="primary">Confirm & Send</Btn>}
          <Btn onClick={printInv} variant="ghost" icon="🖨">Print</Btn>
          <Btn onClick={sendEmail} variant="ghost" icon="✉">Email</Btn>
          <Btn onClick={()=>openModal("invoice",inv)} variant="secondary" icon="✏">Edit</Btn>
          {st!=="Cancelled"&&<Btn onClick={()=>{setInvs(p=>p.map(x=>x.id===inv.id?{...x,status:"Cancelled"}:x));onBack();}} variant="danger" size="sm">Cancel</Btn>}
        </div>
      </div>
      {/* Status timeline */}
      <div style={{background:t.bg2,padding:"12px 24px",borderBottom:`1px solid ${t.bd}`,display:"flex",gap:0,overflowX:"auto"}}>
        {["Draft","Confirmed","Sent","Partial","Paid"].map((s,i)=>{
          const stages=["Draft","Confirmed","Sent","Partial","Paid"];
          const idx=stages.indexOf(st);
          const done=i<=idx;
          const isCurr=stages[i]===st;
          return(
            <React.Fragment key={s}>
              {i>0&&<div style={{flex:1,height:2,background:done?t.a:t.bd,marginTop:14,minWidth:20}}/>}
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:done?t.a:t.bg3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:done?"#fff":t.tx4,border:`2px solid ${done?t.a:t.bd}`}}>
                  {done&&!isCurr?"✓":i+1}
                </div>
                <div style={{fontSize:10,fontWeight:isCurr?700:400,color:isCurr?t.a:t.tx4,whiteSpace:"nowrap"}}>{s}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{padding:24}}>
        <InvoicePrintView inv={inv} co={co} fmt={fmt}/>
        {inv.paid>0&&(
          <div style={{background:t.bg2,borderRadius:14,padding:20,maxWidth:780,margin:"16px auto 0",border:`1px solid ${t.bd}`}}>
            <div style={{fontSize:14,fontWeight:700,color:t.tx,marginBottom:12}}>💰 Payment History</div>
            <div style={{display:"flex",gap:12,alignItems:"center",padding:"12px 16px",background:t.bg3,borderRadius:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:"#10B98120",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>💰</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:t.tx}}>Payment of {fmt(inv.paid)}</div>
                <div style={{fontSize:11,color:t.tx4}}>{fmtDate(inv.paidDate)} · {inv.payMethod}{inv.payRef?" · Ref: "+inv.payRef:""}</div>
              </div>
              <Badge status="Paid" size="md"/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── INVOICES PAGE ───────────────────────────────────────────
function InvoicePage(){
  const {t,tr,fmt,cI,setInvs,openModal}=useApp();
  const [search,setSearch]=React.useState("");
  const [statusFilter,setStatusFilter]=React.useState("all");
  const [viewInv,setViewInv]=React.useState(null);

  if(viewInv){
    const latest=cI.find(i=>i.id===viewInv.id)||viewInv;
    return<InvoiceDetail inv={latest} onBack={()=>setViewInv(null)}/>;
  }

  const filtered=React.useMemo(()=>cI.filter(inv=>{
    const s=search.toLowerCase();
    const matchS=!s||(inv.num||"").toLowerCase().includes(s)||(inv.clientName||"").toLowerCase().includes(s);
    const st=invStatus(inv);
    const matchF=statusFilter==="all"||st.toLowerCase()===statusFilter.toLowerCase();
    return matchS&&matchF;
  }),[cI,search,statusFilter]);

  const stats={
    total:cI.length,
    draft:cI.filter(i=>invStatus(i)==="Draft").length,
    sent:cI.filter(i=>["Sent","Confirmed"].includes(invStatus(i))).length,
    overdue:cI.filter(i=>invStatus(i)==="Overdue").length,
    paid:cI.filter(i=>invStatus(i)==="Paid").length,
    outstanding:cI.filter(i=>["Sent","Overdue","Partial"].includes(invStatus(i))).reduce((s,i)=>s+calcInvBalance(i),0),
  };

  return(
    <div style={{padding:24}}>
      <PageHeader title={tr.invoices} icon="🧾" subtitle={`${stats.total} invoices · Outstanding: ${fmt(stats.outstanding)}`}
        actions={<>
          <Btn onClick={()=>openModal("quote",{})} variant="ghost" icon="📋">New Quote</Btn>
          <Btn onClick={()=>openModal("invoice",{})} variant="primary" icon="＋">{tr.createInvoice}</Btn>
        </>}
      />

      {/* Status pills */}
      <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        {[{id:"all",label:"All",count:stats.total},{id:"Draft",label:"Draft",count:stats.draft},{id:"Sent",label:"Sent",count:stats.sent},{id:"Overdue",label:"Overdue",count:stats.overdue},{id:"Paid",label:"Paid",count:stats.paid}].map(pill=>(
          <button key={pill.id} onClick={()=>setStatusFilter(pill.id)} style={{padding:"6px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,background:statusFilter===pill.id?t.a:t.bg2,color:statusFilter===pill.id?"#fff":t.tx3,display:"flex",alignItems:"center",gap:6,border:`1px solid ${statusFilter===pill.id?t.a:t.bd}`}}>
            {pill.label}
            <span style={{background:statusFilter===pill.id?"rgba(255,255,255,.25)":t.bg3,borderRadius:20,padding:"0 6px",fontSize:10}}>{pill.count}</span>
          </button>
        ))}
        <div style={{marginLeft:"auto"}}><SearchBar value={search} onChange={setSearch} placeholder="Search invoices..."/></div>
      </div>

      {/* Outstanding alert */}
      {stats.overdue>0&&(
        <div style={{background:"#EF444415",border:"1px solid #EF444440",borderRadius:12,padding:"12px 18px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={()=>setStatusFilter("Overdue")}>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <span style={{fontSize:20}}>⚠️</span>
            <div>
              <div style={{fontWeight:700,color:"#EF4444"}}>{stats.overdue} Overdue Invoice{stats.overdue>1?"s":""}</div>
              <div style={{fontSize:12,color:t.tx3}}>These invoices are past their due date</div>
            </div>
          </div>
          <span style={{fontSize:12,color:"#EF4444",fontWeight:700}}>View →</span>
        </div>
      )}

      <Card>
        <Table
          cols={[
            {key:"num",label:"Invoice #",render:(v,row)=><span style={{fontWeight:700,color:t.a,cursor:"pointer"}} onClick={()=>setViewInv(row)}>{v}</span>},
            {key:"clientName",label:"Client",render:(v,row)=><div><div style={{fontWeight:600,color:t.tx}}>{v}</div></div>},
            {key:"date",label:"Issued",render:v=><span style={{color:t.tx3,fontSize:12}}>{fmtDate(v)}</span>},
            {key:"dueDate",label:"Due",render:(v,row)=>{const st=invStatus(row);return<span style={{color:st==="Overdue"?"#EF4444":t.tx3,fontSize:12,fontWeight:st==="Overdue"?700:400}}>{fmtDate(v)}</span>;}},
            {key:"_total",label:"Total",right:true,render:(v,row)=><b style={{fontSize:14}}>{fmt(calcInvTotal(row))}</b>},
            {key:"paid",label:"Paid",right:true,render:v=><span style={{color:"#10B981"}}>{fmt(v||0)}</span>},
            {key:"_bal",label:"Balance",right:true,render:(v,row)=>{const b=calcInvBalance(row);return<span style={{fontWeight:700,color:b>0?"#EF4444":"#10B981"}}>{fmt(b)}</span>;}},
            {key:"_status",label:"Status",render:(v,row)=><Badge status={invStatus(row)}/>},
          ]}
          rows={[...filtered].sort((a,b)=>b.date.localeCompare(a.date))}
          onRowClick={setViewInv}
          actions={row=>(
            <div style={{display:"flex",gap:4}}>
              <Btn size="sm" variant="secondary" onClick={()=>setViewInv(row)}>View</Btn>
              {invStatus(row)!=="Paid"&&invStatus(row)!=="Cancelled"&&<Btn size="sm" variant="primary" onClick={()=>openModal("payment",row)}>Pay</Btn>}
            </div>
          )}
        />
      </Card>
    </div>
  );
}

// ─── QUOTES PAGE ─────────────────────────────────────────────
function QuotesPage(){
  const {t,tr,fmt,cQ,setQuotes,setInvs,acId,openModal,showToast,cC}=useApp();
  const [search,setSearch]=React.useState("");

  const convertToInvoice=(quote)=>{
    const num=`INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const inv={...quote,id:uid(),num,status:"Draft",paid:0,paidDate:"",payMethod:"",payRef:"",date:today()};
    delete inv.validUntil;delete inv.convertedToInvoice;
    setInvs(p=>[...p,inv]);
    setQuotes(p=>p.map(q=>q.id===quote.id?{...q,convertedToInvoice:true,invoiceNum:num}:q));
    showToast(`Converted to ${num}`,"success");
  };

  const filtered=cQ.filter(q=>{
    const s=search.toLowerCase();
    return!s||(q.num||"").toLowerCase().includes(q)||(q.clientName||"").toLowerCase().includes(s);
  });

  return(
    <div style={{padding:24}}>
      <PageHeader title="Quotes & Proposals" icon="📋" subtitle={`${cQ.length} quotes`}
        actions={<Btn onClick={()=>openModal("quote",{})} variant="primary" icon="＋">New Quote</Btn>}
      />
      <div style={{marginBottom:16}}><SearchBar value={search} onChange={setSearch} placeholder="Search quotes..."/></div>
      <Card>
        <Table
          cols={[
            {key:"num",label:"Quote #",render:v=><span style={{fontWeight:700,color:t.a}}>{v}</span>},
            {key:"clientName",label:"Client"},
            {key:"date",label:"Date",render:v=><span style={{color:t.tx3,fontSize:12}}>{fmtDate(v)}</span>},
            {key:"validUntil",label:"Valid Until",render:v=><span style={{color:v<today()?"#EF4444":t.tx3,fontSize:12}}>{fmtDate(v)}</span>},
            {key:"_total",label:"Total",right:true,render:(v,row)=><b>{fmt(calcInvTotal(row))}</b>},
            {key:"status",label:"Status",render:v=><Badge status={v}/>},
            {key:"convertedToInvoice",label:"Converted",render:v=><Badge status={v?"Converted":"Not yet"}/>},
          ]}
          rows={[...filtered].sort((a,b)=>b.date.localeCompare(a.date))}
          actions={row=>(
            <div style={{display:"flex",gap:4}}>
              {!row.convertedToInvoice&&<Btn size="sm" variant="primary" onClick={()=>convertToInvoice(row)}>→ Invoice</Btn>}
              <Btn size="sm" variant="secondary" onClick={()=>openModal("quote",row)}>✏</Btn>
              <Btn size="sm" variant="danger" onClick={()=>setQuotes(p=>p.filter(x=>x.id!==row.id))}>×</Btn>
            </div>
          )}
        />
      </Card>
    </div>
  );
}

// ─── REVENUE PAGE ────────────────────────────────────────────
function RevenuePage(){
  const {t,tr,fmt,cR,setRevs,openModal}=useApp();
  const [search,setSearch]=React.useState("");
  const [catFilter,setCatFilter]=React.useState("all");
  const [monthFilter,setMonthFilter]=React.useState("all");

  const months=[...new Set(cR.map(r=>monthKey(r.date)).filter(Boolean))].sort().reverse();
  const cats=[...new Set(cR.map(r=>r.cat).filter(Boolean))];

  const filtered=React.useMemo(()=>cR.filter(r=>{
    const s=search.toLowerCase();
    return(!s||(r.description||"").toLowerCase().includes(s)||(r.customer||"").toLowerCase().includes(s))&&
      (catFilter==="all"||r.cat===catFilter)&&
      (monthFilter==="all"||monthKey(r.date)===monthFilter);
  }),[cR,search,catFilter,monthFilter]);

  const total=filtered.reduce((s,r)=>s+r.amount,0);
  const byCat=cats.reduce((a,c)=>({...a,[c]:filtered.filter(r=>r.cat===c).reduce((s,r)=>s+r.amount,0)}),{});

  return(
    <div style={{padding:24}}>
      <PageHeader title={tr.revenue} icon="💰" subtitle={`${filtered.length} entries · ${fmt(total)}`}
        actions={<>
          <Btn onClick={()=>{const ws=XLSX.utils.json_to_sheet(cR);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"Revenue");XLSX.writeFile(wb,"revenue.xlsx");}} variant="ghost" icon="📥">Export</Btn>
          <Btn onClick={()=>openModal("revenue",{})} variant="primary" icon="＋">Add Revenue</Btn>
        </>}
      />
      {/* Category mini cards */}
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:16}}>
        {Object.entries(byCat).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([cat,amt])=>(
          <div key={cat} onClick={()=>setCatFilter(catFilter===cat?"all":cat)} style={{background:t.bg2,borderRadius:10,padding:"10px 16px",cursor:"pointer",border:`1.5px solid ${catFilter===cat?t.a:t.bd}`,flexShrink:0,minWidth:120}}>
            <div style={{fontSize:11,color:t.tx4,marginBottom:3}}>{cat}</div>
            <div style={{fontSize:14,fontWeight:800,color:"#10B981"}}>{fmt(amt)}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search revenue..."/>
        <select value={monthFilter} onChange={e=>setMonthFilter(e.target.value)} style={{padding:"9px 14px",borderRadius:10,border:`1.5px solid ${t.bd}`,background:t.bg2,color:t.tx,fontSize:13,outline:"none"}}>
          <option value="all">All Months</option>
          {months.map(m=><option key={m} value={m}>{monthName(m)}</option>)}
        </select>
        <div style={{marginLeft:"auto",fontSize:18,fontWeight:900,color:"#10B981"}}>{fmt(total)}</div>
      </div>
      <Card>
        <Table
          cols={[
            {key:"date",label:"Date",render:v=><span style={{color:t.tx3,fontSize:12}}>{fmtDate(v)}</span>},
            {key:"description",label:"Description",wrap:true},
            {key:"customer",label:"Customer",render:v=><span style={{color:t.tx3}}>{v||"—"}</span>},
            {key:"cat",label:"Category",render:v=><Badge status={v}/>},
            {key:"payMethod",label:"Method",render:v=><span style={{color:t.tx4,fontSize:12}}>{v}</span>},
            {key:"ref",label:"Ref",render:v=><span style={{color:t.tx5,fontSize:11}}>{v||"—"}</span>},
            {key:"amount",label:"Amount",right:true,render:v=><span style={{fontWeight:800,color:"#10B981",fontSize:14}}>{fmt(v)}</span>},
          ]}
          rows={[...filtered].sort((a,b)=>b.date?.localeCompare(a.date))}
          actions={row=>(
            <div style={{display:"flex",gap:4}}>
              <Btn size="sm" variant="secondary" onClick={()=>openModal("revenue",row)}>✏</Btn>
              <Btn size="sm" variant="danger" onClick={()=>{if(confirm(tr.confirmDelete))setRevs(p=>p.filter(x=>x.id!==row.id));}}>×</Btn>
            </div>
          )}
        />
      </Card>
    </div>
  );
}

// ─── EXPENSE PAGE ────────────────────────────────────────────
function ExpensePage(){
  const {t,tr,fmt,cE,setExps,openModal}=useApp();
  const [search,setSearch]=React.useState("");
  const [catFilter,setCatFilter]=React.useState("all");

  const filtered=React.useMemo(()=>cE.filter(e=>{
    const s=search.toLowerCase();
    return(!s||(e.description||"").toLowerCase().includes(s)||(e.vendor||"").toLowerCase().includes(s))&&
      (catFilter==="all"||e.cat===catFilter);
  }),[cE,search,catFilter]);

  const total=filtered.reduce((s,e)=>s+e.amount,0);
  const byCat=[...new Set(cE.map(e=>e.cat))].filter(Boolean).map(c=>({cat:c,amt:cE.filter(e=>e.cat===c).reduce((s,e)=>s+e.amount,0)})).sort((a,b)=>b.amt-a.amt);

  return(
    <div style={{padding:24}}>
      <PageHeader title={tr.expenses} icon="📉" subtitle={`${filtered.length} entries · ${fmt(total)}`}
        actions={<Btn onClick={()=>openModal("expense",{})} variant="primary" icon="＋">Add Expense</Btn>}
      />
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:16}}>
        {byCat.slice(0,6).map(({cat,amt})=>(
          <div key={cat} onClick={()=>setCatFilter(catFilter===cat?"all":cat)} style={{background:t.bg2,borderRadius:10,padding:"10px 16px",cursor:"pointer",border:`1.5px solid ${catFilter===cat?"#EF4444":t.bd}`,flexShrink:0,minWidth:120}}>
            <div style={{fontSize:11,color:t.tx4,marginBottom:3}}>{cat}</div>
            <div style={{fontSize:14,fontWeight:800,color:"#EF4444"}}>{fmt(amt)}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search expenses..."/>
        <div style={{marginLeft:"auto",fontSize:18,fontWeight:900,color:"#EF4444"}}>{fmt(total)}</div>
      </div>
      <Card>
        <Table
          cols={[
            {key:"date",label:"Date",render:v=><span style={{color:t.tx3,fontSize:12}}>{fmtDate(v)}</span>},
            {key:"description",label:"Description",wrap:true},
            {key:"vendor",label:"Vendor",render:v=><span style={{color:t.tx3}}>{v||"—"}</span>},
            {key:"cat",label:"Category",render:v=><Badge status={v}/>},
            {key:"payMethod",label:"Method",render:v=><span style={{color:t.tx4,fontSize:12}}>{v}</span>},
            {key:"costCenter",label:"Cost Center",render:v=><span style={{color:t.tx4,fontSize:12}}>{v||"—"}</span>},
            {key:"amount",label:"Amount",right:true,render:v=><span style={{fontWeight:800,color:"#EF4444",fontSize:14}}>{fmt(v)}</span>},
          ]}
          rows={[...filtered].sort((a,b)=>b.date?.localeCompare(a.date))}
          actions={row=>(
            <div style={{display:"flex",gap:4}}>
              <Btn size="sm" variant="secondary" onClick={()=>openModal("expense",row)}>✏</Btn>
              <Btn size="sm" variant="danger" onClick={()=>{if(confirm(tr.confirmDelete))setExps(p=>p.filter(x=>x.id!==row.id));}}>×</Btn>
            </div>
          )}
        />
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  MASHRO3Y v7 — REMAINING PAGE MODULES
// ═══════════════════════════════════════════════════════════

// ─── DASHBOARD ───────────────────────────────────────────────
function Dashboard(){
  const {t,tr,fmt,cR,cE,cI,cC,cW,cVA,cLoans,openModal,setMod}=useApp();
  const m=monthKey(today());const lm=monthKey(new Date(new Date().setMonth(new Date().getMonth()-1)).toISOString());
  const mR=cR.filter(r=>monthKey(r.date)===m).reduce((s,r)=>s+r.amount,0);
  const lmR=cR.filter(r=>monthKey(r.date)===lm).reduce((s,r)=>s+r.amount,0);
  const mE=cE.filter(e=>monthKey(e.date)===m).reduce((s,e)=>s+e.amount,0);
  const lmE=cE.filter(e=>monthKey(e.date)===lm).reduce((s,e)=>s+e.amount,0);
  const outstanding=cI.filter(i=>["Sent","Overdue","Partial"].includes(invStatus(i))).reduce((s,i)=>s+calcInvBalance(i),0);
  const overdue=cI.filter(i=>invStatus(i)==="Overdue");
  const vaultTotal=cVA.reduce((s,a)=>s+a.balance,0);
  const pct=(a,b)=>b>0?Math.round(((a-b)/b)*100):0;
  const recent=[...cR.map(r=>({icon:"💰",title:r.description,sub:r.customer||r.cat,amount:"+"+fmt(r.amount),color:"#10B981",date:r.date})),...cE.map(e=>({icon:"📉",title:e.description,sub:e.vendor||e.cat,amount:"-"+fmt(e.amount),color:"#EF4444",date:e.date}))].sort((a,b)=>b.date?.localeCompare(a.date)).slice(0,8);
  const quick=[{icon:"🧾",label:"New Invoice",action:()=>openModal("invoice",{})},{icon:"💰",label:"Add Revenue",action:()=>openModal("revenue",{})},{icon:"📉",label:"Add Expense",action:()=>openModal("expense",{})},{icon:"👥",label:"Add Client",action:()=>openModal("client",{})},{icon:"👷",label:"Add Employee",action:()=>openModal("worker",{})},{icon:"💳",label:"Employee Loan",action:()=>openModal("workerLoan",{})},{icon:"🏦",label:"Vault Transfer",action:()=>openModal("vaultTx",{})},{icon:"📋",label:"New Quote",action:()=>openModal("quote",{})}];
  return(
    <div style={{padding:24}}>
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:26,fontWeight:900,color:t.tx,margin:0}}>Good {new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"} 👋</h1>
        <div style={{fontSize:13,color:t.tx4,marginTop:4}}>{new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
      </div>
      {overdue.length>0&&<div style={{background:"#EF444415",border:"1px solid #EF444440",borderRadius:14,padding:"14px 18px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={()=>setMod("invoices")}>
        <div style={{display:"flex",gap:12,alignItems:"center"}}><span style={{fontSize:24}}>⚠️</span><div><div style={{fontWeight:700,color:"#EF4444",fontSize:14}}>{overdue.length} Overdue Invoice{overdue.length>1?"s":""} — Action Required</div><div style={{fontSize:12,color:t.tx3}}>Total overdue: {fmt(overdue.reduce((s,i)=>s+calcInvBalance(i),0))}</div></div></div>
        <span style={{color:"#EF4444",fontSize:13,fontWeight:700}}>View All →</span>
      </div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:14,marginBottom:24}}>
        <StatCard label="Revenue (This Month)" value={fmt(mR)} sub={`vs ${fmt(lmR)} last month`} icon="💰" color="#10B981" trend={pct(mR,lmR)} onClick={()=>setMod("revenues")}/>
        <StatCard label="Expenses (This Month)" value={fmt(mE)} sub={`vs ${fmt(lmE)} last month`} icon="📉" color="#EF4444" trend={pct(mE,lmE)} onClick={()=>setMod("expenses")}/>
        <StatCard label="Net Profit" value={fmt(mR-mE)} sub={`Margin ${mR>0?Math.round(((mR-mE)/mR)*100):0}%`} icon="📊" color={mR>mE?"#10B981":"#EF4444"} trend={pct(mR-mE,lmR-lmE)} onClick={()=>setMod("reports")}/>
        <StatCard label="Outstanding" value={fmt(outstanding)} sub={`${cI.filter(i=>["Sent","Overdue","Partial"].includes(invStatus(i))).length} invoices`} icon="⏳" color="#F59E0B" onClick={()=>setMod("invoices")}/>
        <StatCard label="Vault Balance" value={fmt(vaultTotal)} sub={`${cVA.length} accounts`} icon="🏦" color="#3B82F6" onClick={()=>setMod("vault")}/>
        <StatCard label="Active Employees" value={cW.filter(w=>w.status==="Active").length} sub={`${cLoans.filter(l=>l.status==="Active").length} have loans`} icon="👷" color="#8B5CF6" onClick={()=>setMod("workers")}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:16}}>
        <Section title="Recent Activity" icon="🕐">
          {recent.map((item,i)=><ActivityItem key={i} icon={item.icon} title={item.title} sub={item.sub} amount={item.amount} amountColor={item.color} time={fmtDate(item.date)}/>)}
        </Section>
        <div>
          <Section title="Quick Actions" icon="⚡">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {quick.map((q,i)=><button key={i} onClick={q.action} style={{padding:"12px 10px",borderRadius:12,border:`1.5px solid ${t.bd}`,background:t.bg3,color:t.tx2,cursor:"pointer",fontSize:12,fontWeight:700,display:"flex",flexDirection:"column",alignItems:"center",gap:6,transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=t.a;e.currentTarget.style.color=t.a;e.currentTarget.style.background=`${t.a}10`;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=t.bd;e.currentTarget.style.color=t.tx2;e.currentTarget.style.background=t.bg3;}}><span style={{fontSize:22}}>{q.icon}</span><span>{q.label}</span></button>)}
            </div>
          </Section>
          {cI.filter(i=>invStatus(i)==="Overdue").length>0&&<Section title="Overdue Invoices" icon="⚠">
            {cI.filter(i=>invStatus(i)==="Overdue").slice(0,3).map(inv=><div key={inv.id} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${t.bd}`,fontSize:13}}>
              <div><div style={{fontWeight:700,color:t.tx}}>{inv.clientName}</div><div style={{fontSize:11,color:t.tx4}}>{inv.num} · Due {fmtDate(inv.dueDate)}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontWeight:700,color:"#EF4444"}}>{fmt(calcInvBalance(inv))}</div><div style={{fontSize:11,color:t.tx4}}>{daysBetween(inv.dueDate,today())}d overdue</div></div>
            </div>)}
          </Section>}
        </div>
      </div>
    </div>
  );
}

// ─── VAULT PAGE ───────────────────────────────────────────────
function VaultPage(){
  const {t,tr,fmt,cVA,cVT,setVAccs,openModal}=useApp();
  const [tab,setTab]=React.useState("accounts");
  const [selAcc,setSelAcc]=React.useState(null);
  const total=cVA.reduce((s,a)=>s+a.balance,0);
  const txs=selAcc?cVT.filter(tx=>tx.accId===selAcc):cVT;
  return(
    <div style={{padding:24}}>
      <PageHeader title={tr.vault} icon="🏦" subtitle={`${cVA.length} accounts · Total: ${fmt(total)}`} actions={<><Btn onClick={()=>openModal("vaultAcc",{})} variant="secondary" icon="＋">New Account</Btn><Btn onClick={()=>openModal("vaultTx",{})} variant="primary" icon="💸">New Transaction</Btn></>}/>
      <Tabs tabs={[{id:"accounts",label:"Accounts",icon:"🏦"},{id:"history",label:"Transaction History",icon:"📋",count:cVT.length}]} active={tab} onChange={setTab}/>
      {tab==="accounts"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {cVA.map(acc=>{const txList=cVT.filter(tx=>tx.accId===acc.id);const inflow=txList.filter(t=>t.type==="in").reduce((s,t)=>s+t.amount,0);const outflow=txList.filter(t=>t.type==="out").reduce((s,t)=>s+t.amount,0);return(
          <Card key={acc.id} style={{padding:20}} onClick={()=>{setSelAcc(selAcc===acc.id?null:acc.id);setTab("history");}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
              <div style={{width:44,height:44,borderRadius:12,background:`${t.a}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🏦</div>
              <Badge status={acc.type}/>
            </div>
            <div style={{fontSize:15,fontWeight:800,color:t.tx,marginBottom:2}}>{acc.name}</div>
            <div style={{fontSize:12,color:t.tx4,marginBottom:14}}>{acc.bank}{acc.number?" · "+acc.number.slice(-6):"" }</div>
            <div style={{fontSize:28,fontWeight:900,color:acc.balance<0?"#EF4444":t.a,marginBottom:12}}>{fmtCur(acc.balance,acc.currency)}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
              <div style={{background:"#10B98115",borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:10,color:"#10B981"}}>INFLOW</div><div style={{fontWeight:700,color:"#10B981"}}>{fmtCur(inflow,acc.currency)}</div></div>
              <div style={{background:"#EF444415",borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:10,color:"#EF4444"}}>OUTFLOW</div><div style={{fontWeight:700,color:"#EF4444"}}>{fmtCur(outflow,acc.currency)}</div></div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <Btn size="sm" variant="primary" onClick={e=>{e.stopPropagation();openModal("vaultTx",{accId:acc.id});}} style={{flex:1}}>＋ Transaction</Btn>
              <Btn size="sm" variant="ghost" onClick={e=>{e.stopPropagation();openModal("vaultAcc",acc);}}>✏</Btn>
              <Btn size="sm" variant="danger" onClick={e=>{e.stopPropagation();if(confirm(tr.confirmDelete))setVAccs(p=>p.filter(x=>x.id!==acc.id));}}>×</Btn>
            </div>
          </Card>
        );})}
      </div>}
      {tab==="history"&&<><div style={{marginBottom:12,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <Btn size="sm" variant={selAcc===null?"primary":"ghost"} onClick={()=>setSelAcc(null)}>All Accounts</Btn>
          {cVA.map(a=><Btn key={a.id} size="sm" variant={selAcc===a.id?"primary":"ghost"} onClick={()=>setSelAcc(a.id)}>{a.name}</Btn>)}
        </div>
      </div>
      <Card><Table cols={[
        {key:"date",label:"Date",render:v=><span style={{color:t.tx3,fontSize:12}}>{fmtDate(v)}</span>},
        {key:"desc",label:"Description",wrap:true},
        {key:"cat",label:"Category",render:v=><Badge status={v}/>},
        {key:"ref",label:"Ref",render:v=><span style={{color:t.tx5,fontSize:11}}>{v||"—"}</span>},
        {key:"amount",label:"Amount",right:true,render:(v,row)=><span style={{fontWeight:700,color:row.type==="in"?"#10B981":"#EF4444",fontSize:14}}>{row.type==="in"?"+":"-"}{fmt(v)}</span>},
        {key:"_acc",label:"Account",render:(v,row)=><span style={{color:t.tx4,fontSize:11}}>{cVA.find(a=>a.id===row.accId)?.name||"—"}</span>},
      ]} rows={[...txs].sort((a,b)=>b.date?.localeCompare(a.date))}/></Card></>}
    </div>
  );
}

// ─── PROCUREMENT PAGE ─────────────────────────────────────────
// ─── SUPPLIER PROFILE PAGE ──────────────────────────────────
function SupplierProfile({supplier,onBack}){
  const {t,tr,fmt,cPO,cProd,openModal,setSups,acId,lang}=useApp();
  const [tab,setTab]=React.useState("overview");
  const [notes,setNotes]=React.useState(()=>{try{return JSON.parse(localStorage.getItem("m3y_snotes_"+supplier.id)||"[]");}catch{return[];}});
  const [noteText,setNoteText]=React.useState("");

  const supPOs=cPO.filter(p=>p.supId===supplier.id);
  const totalSpend=supPOs.reduce((s,po)=>s+(po.lines||[]).reduce((x,l)=>x+(+l.qty||0)*(+l.price||0)*(1+((+l.tax||0)/100)),0),0);
  const pendingPOs=supPOs.filter(p=>!["Received","Cancelled"].includes(p.status));
  const receivedPOs=supPOs.filter(p=>p.status==="Received");

  const saveNote=()=>{
    if(!noteText.trim())return;
    const n={id:uid(),text:noteText.trim(),date:today(),author:"You"};
    const updated=[n,...notes];
    setNotes(updated);
    localStorage.setItem("m3y_snotes_"+supplier.id,JSON.stringify(updated));
    setNoteText("");
  };
  const deleteNote=(id)=>{const updated=notes.filter(n=>n.id!==id);setNotes(updated);localStorage.setItem("m3y_snotes_"+supplier.id,JSON.stringify(updated));};

  const starColor="#F59E0B";
  const stars=(r)=>"★".repeat(r||0)+"☆".repeat(5-(r||0));

  return(
    <div style={{minHeight:"100vh",background:t.bg}}>
      {/* Header */}
      <div style={{background:t.bg2,borderBottom:`1px solid ${t.bd}`,padding:"20px 24px"}}>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:t.tx3,cursor:"pointer",fontSize:13,fontWeight:600,marginBottom:16}}>← {tr.back}</button>
        <div style={{display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap"}}>
          <div style={{width:64,height:64,borderRadius:16,background:`${t.a}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:900,color:t.a}}>
            {(supplier.name||"?").slice(0,2).toUpperCase()}
          </div>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:4}}>
              <h1 style={{fontSize:22,fontWeight:900,color:t.tx,margin:0}}>{supplier.name}</h1>
              <span style={{color:starColor,fontSize:16,letterSpacing:1}}>{stars(supplier.rating)}</span>
            </div>
            <div style={{fontSize:13,color:t.tx3,marginBottom:2}}>{supplier.cat} · {lang==="ar"?"شروط دفع":"Payment terms"}: {supplier.terms} {lang==="ar"?"يوم":"days"}</div>
            <div style={{fontSize:12,color:t.tx4,marginBottom:8}}>{supplier.address}</div>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              {supplier.phone&&<a href={`tel:${supplier.phone}`} style={{fontSize:12,color:t.a,textDecoration:"none"}}>📞 {supplier.phone}</a>}
              {supplier.email&&<a href={`mailto:${supplier.email}`} style={{fontSize:12,color:t.a,textDecoration:"none"}}>✉ {supplier.email}</a>}
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={()=>openModal("po",{supId:supplier.id})} variant="primary" icon="📦">{lang==="ar"?"أمر شراء":"New PO"}</Btn>
            <Btn onClick={()=>openModal("supplier",supplier)} variant="secondary" icon="✏">{tr.edit}</Btn>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{padding:"16px 24px 0"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10,marginBottom:16}}>
          {[
            {label:lang==="ar"?"إجمالي الإنفاق":"Total Spend",value:fmt(totalSpend),color:"#EF4444",icon:"💸"},
            {label:lang==="ar"?"أوامر الشراء":"Purchase Orders",value:supPOs.length,color:t.a,icon:"📦"},
            {label:lang==="ar"?"قيد التنفيذ":"Pending",value:pendingPOs.length,color:"#F59E0B",icon:"⏳"},
            {label:lang==="ar"?"مستلم":"Received",value:receivedPOs.length,color:"#10B981",icon:"✅"},
            {label:lang==="ar"?"تقييم المورد":"Rating",value:stars(supplier.rating).slice(0,supplier.rating||0),color:starColor,icon:"⭐"},
          ].map((s,i)=>(
            <div key={i} style={{background:t.bg2,borderRadius:12,padding:"12px 14px",border:`1px solid ${t.bd}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:10,color:t.tx4,fontWeight:700,textTransform:"uppercase"}}>{s.label}</span>
                <span style={{fontSize:15}}>{s.icon}</span>
              </div>
              <div style={{fontSize:15,fontWeight:800,color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>

        <Tabs tabs={[
          {id:"overview",label:lang==="ar"?"نظرة عامة":"Overview",icon:"🏭"},
          {id:"pos",label:lang==="ar"?"أوامر الشراء":"Purchase Orders",icon:"📦",count:supPOs.length},
          {id:"products",label:lang==="ar"?"المنتجات":"Products",icon:"🛍"},
          {id:"payments",label:lang==="ar"?"المدفوعات":"Payments",icon:"💳"},
          {id:"notes",label:lang==="ar"?"الملاحظات":"Notes",icon:"📝",count:notes.length},
        ]} active={tab} onChange={setTab}/>
      </div>

      <div style={{padding:"0 24px 24px"}}>
        {/* OVERVIEW */}
        {tab==="overview"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:16}}>
            <Section title={lang==="ar"?"معلومات المورد":"Supplier Info"} icon="🏭">
              <InfoGrid cols={1} items={[
                {label:lang==="ar"?"اسم المورد":"Supplier Name",value:supplier.name},
                {label:lang==="ar"?"الفئة":"Category",value:supplier.cat},
                {label:lang==="ar"?"مسؤول الاتصال":"Contact Person",value:supplier.contact},
                {label:tr.phone,value:supplier.phone},
                {label:tr.email,value:supplier.email},
                {label:tr.address,value:supplier.address},
                {label:lang==="ar"?"الرقم الضريبي":"Tax / VAT No.",value:supplier.taxNum},
                {label:lang==="ar"?"شروط الدفع":"Payment Terms",value:`${supplier.terms} days`},
                {label:tr.currency,value:supplier.currency},
                {label:lang==="ar"?"التقييم":"Rating",value:stars(supplier.rating)},
              ]}/>
            </Section>
            <Section title={lang==="ar"?"تفاصيل بنكية":"Bank Details"} icon="🏦">
              <InfoGrid cols={1} items={[
                {label:lang==="ar"?"التفاصيل البنكية":"Bank Details",value:supplier.bankDetails||"—"},
                {label:lang==="ar"?"إجمالي الإنفاق":"Total Spend",value:fmt(totalSpend),color:"#EF4444"},
                {label:lang==="ar"?"أوامر الشراء":"Total POs",value:supPOs.length+" orders"},
                {label:lang==="ar"?"مستلم":"Received",value:receivedPOs.length+" orders",color:"#10B981"},
                {label:lang==="ar"?"معلق":"Pending",value:pendingPOs.length+" orders",color:pendingPOs.length>0?"#F59E0B":undefined},
                {label:lang==="ar"?"ملاحظات":"Notes",value:supplier.notes||"—"},
              ]}/>
            </Section>
          </div>
        )}

        {/* PURCHASE ORDERS */}
        {tab==="pos"&&(
          <div style={{marginTop:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:13,color:t.tx3,fontWeight:600}}>{supPOs.length} {lang==="ar"?"أمر شراء":"Purchase Orders"}</div>
              <Btn onClick={()=>openModal("po",{supId:supplier.id})} variant="primary" icon="＋">{lang==="ar"?"أمر جديد":"New PO"}</Btn>
            </div>
            {supPOs.length===0?<EmptyState icon="📦" title={lang==="ar"?"لا توجد أوامر شراء":"No purchase orders"} subtitle=""/>:(
              supPOs.sort((a,b)=>b.date.localeCompare(a.date)).map(po=>{
                const poTotal=(po.lines||[]).reduce((s,l)=>s+(+l.qty||0)*(+l.price||0)*(1+((+l.tax||0)/100)),0);
                const stColors={Received:"#10B981",Confirmed:"#3B82F6",Partial:"#F59E0B",Draft:"#94A3B8",Cancelled:"#EF4444",Sent:"#8B5CF6"};
                return(
                  <div key={po.id} style={{background:t.bg2,borderRadius:14,border:`1px solid ${t.bd}`,padding:"14px 16px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
                    <div>
                      <div style={{fontWeight:800,color:t.a,marginBottom:3}}>{po.num}</div>
                      <div style={{fontSize:12,color:t.tx3}}>{fmtDate(po.date)} · {lang==="ar"?"تسليم":"Delivery"}: {fmtDate(po.delivDate)}</div>
                      <div style={{fontSize:11,color:t.tx4,marginTop:2}}>{(po.lines||[]).length} {lang==="ar"?"بند":"items"}</div>
                    </div>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <Badge status={po.status}/>
                      <span style={{fontWeight:800,color:t.a,fontSize:14}}>{fmt(poTotal)}</span>
                      <Btn size="sm" variant="secondary" onClick={()=>openModal("po",po)}>✏</Btn>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* PAYMENTS */}
        {tab==="payments"&&(
          <div style={{marginTop:16}}>
            <div style={{fontSize:13,color:t.tx3,fontWeight:600,marginBottom:12}}>{lang==="ar"?"سجل المدفوعات":"Payment history based on received purchase orders"}</div>
            {receivedPOs.length===0?<EmptyState icon="💳" title={lang==="ar"?"لا توجد مدفوعات":"No payments yet"} subtitle=""/>:(
              <div>
                {receivedPOs.map(po=>{
                  const poTotal=(po.lines||[]).reduce((s,l)=>s+(+l.qty||0)*(+l.price||0)*(1+((+l.tax||0)/100)),0);
                  return(
                    <div key={po.id} style={{background:t.bg2,borderRadius:12,padding:"12px 16px",marginBottom:8,border:`1px solid ${t.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontWeight:700,color:t.tx,marginBottom:2}}>{po.num}</div>
                        <div style={{fontSize:12,color:t.tx3}}>{lang==="ar"?"تاريخ الاستلام":"Received"}: {fmtDate(po.receivedDate)}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontWeight:900,color:"#EF4444",fontSize:16}}>{fmt(poTotal)}</div>
                        <div style={{fontSize:11,color:t.tx4}}>{po.currency}</div>
                      </div>
                    </div>
                  );
                })}
                <div style={{background:`#EF444415`,borderRadius:12,padding:"12px 16px",marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontWeight:800,color:t.tx}}>{lang==="ar"?"إجمالي الإنفاق":"Total Spend (Received)"}</span>
                  <span style={{fontWeight:900,fontSize:18,color:"#EF4444"}}>{fmt(totalSpend)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* NOTES */}
        {tab==="notes"&&(
          <div style={{marginTop:16,maxWidth:680}}>
            <div style={{marginBottom:14}}>
              <textarea value={noteText} onChange={e=>setNoteText(e.target.value)}
                placeholder={lang==="ar"?"اكتب ملاحظة عن المورد...":"Write a note about this supplier..."}
                style={{width:"100%",padding:"12px 14px",borderRadius:10,border:`1.5px solid ${t.bd}`,background:t.bg3,color:t.tx,fontSize:13,resize:"vertical",minHeight:72,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}
                onFocus={e=>e.target.style.borderColor=t.a} onBlur={e=>e.target.style.borderColor=t.bd}/>
              <div style={{display:"flex",justifyContent:"flex-end",marginTop:6}}>
                <Btn onClick={saveNote} variant="primary" icon="💾">{lang==="ar"?"حفظ":"Save Note"}</Btn>
              </div>
            </div>
            {notes.length===0?<EmptyState icon="📝" title={lang==="ar"?"لا توجد ملاحظات":"No notes"} subtitle=""/>:(
              notes.map(n=>(
                <div key={n.id} style={{background:t.bg2,borderRadius:12,padding:"12px 14px",marginBottom:8,border:`1px solid ${t.bd}`}}>
                  <div style={{fontSize:13,color:t.tx,lineHeight:1.6,marginBottom:6,whiteSpace:"pre-wrap"}}>{n.text}</div>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:11,color:t.tx4}}>{fmtDate(n.date)}</span>
                    <button onClick={()=>deleteNote(n.id)} style={{background:"none",border:"none",color:t.tx4,cursor:"pointer",fontSize:16}}>×</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {tab==="products"&&(
          <div style={{marginTop:16}}>
            {(() => {
              const supProds = cProd.filter(p => p.supplierId === supplier.id || p.supplier === supplier.name);
              return supProds.length === 0 ? (
                <EmptyState icon="🛍" title={lang==="ar"?"لا توجد منتجات مرتبطة":"No products linked"}
                  subtitle={lang==="ar"?"المنتجات المرتبطة بهذا المورد ستظهر هنا":"Products linked to this supplier appear here"}
                  action={<Btn onClick={()=>openModal("product",{supplierId:supplier.id,supplier:supplier.name})} variant="primary">{lang==="ar"?"إضافة منتج":"Add Product"}</Btn>}/>
              ) : (
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div style={{fontSize:13,color:t.tx3,fontWeight:600}}>{supProds.length} {lang==="ar"?"منتج":"products"}</div>
                    <Btn onClick={()=>openModal("product",{supplierId:supplier.id,supplier:supplier.name})} variant="primary" icon="＋">{lang==="ar"?"إضافة منتج":"Add Product"}</Btn>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
                    {supProds.map(prod=>(
                      <div key={prod.id} style={{background:t.bg2,borderRadius:14,border:`1px solid ${t.bd}`,padding:"14px 16px",transition:"box-shadow .15s"}}
                        onMouseEnter={e=>e.currentTarget.style.boxShadow=t.sh2}
                        onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"flex-start"}}>
                          <div style={{fontWeight:800,color:t.tx,fontSize:13,flex:1}}>{prod.name}</div>
                          <Badge status={prod.status||"Active"}/>
                        </div>
                        <div style={{fontSize:11,color:t.tx4,marginBottom:8}}>{prod.cat} · {prod.unit}</div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:12}}>
                          <div><div style={{color:t.tx4,fontSize:10}}>{lang==="ar"?"سعر الشراء":"Buy Price"}</div><div style={{fontWeight:700,color:"#EF4444"}}>{fmt(prod.buyPrice||0)}</div></div>
                          <div><div style={{color:t.tx4,fontSize:10}}>{lang==="ar"?"سعر البيع":"Sale Price"}</div><div style={{fontWeight:700,color:"#10B981"}}>{fmt(prod.salePrice||0)}</div></div>
                          <div><div style={{color:t.tx4,fontSize:10}}>{lang==="ar"?"المخزون":"Stock"}</div><div style={{fontWeight:700,color:prod.stock<(prod.minStock||0)?"#EF4444":t.tx}}>{prod.stock||0} {prod.unit}</div></div>
                          <div><div style={{color:t.tx4,fontSize:10}}>{lang==="ar"?"هامش الربح":"Margin"}</div><div style={{fontWeight:700,color:"#8B5CF6"}}>{prod.buyPrice&&prod.salePrice?Math.round(((prod.salePrice-prod.buyPrice)/prod.salePrice)*100)+"%" :"—"}</div></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

function ProcurementPage(){
  const {t,tr,fmt,cSup,cPO,setSups,setPos,openModal,lang}=useApp();
  const [tab,setTab]=React.useState("pos");
  const [expand,setExpand]=React.useState(null);
  const [selectedSupplier,setSelectedSupplier]=React.useState(null);
  if(selectedSupplier)return<SupplierProfile supplier={selectedSupplier} onBack={()=>setSelectedSupplier(null)}/>;
  const poTotal=cPO.reduce((s,po)=>s+(po.lines||[]).reduce((x,l)=>x+(l.qty||0)*(l.price||0),0),0);
  return(
    <div style={{padding:24}}>
      <PageHeader title={tr.procurement} icon="🛒" subtitle={`${cPO.length} orders · ${cSup.length} suppliers`} actions={<><Btn onClick={()=>openModal("supplier",{})} variant="secondary" icon="＋">Add Supplier</Btn><Btn onClick={()=>openModal("po",{})} variant="primary" icon="＋">Create PO</Btn></>}/>
      <Tabs tabs={[{id:"pos",label:"Purchase Orders",icon:"📦",count:cPO.length},{id:"suppliers",label:"Suppliers",icon:"🤝",count:cSup.length}]} active={tab} onChange={setTab}/>
      {tab==="pos"&&cPO.map(po=>{const sup=cSup.find(s=>s.id===po.supId);const poTotal=(po.lines||[]).reduce((s,l)=>s+(l.qty||0)*(l.price||0)*(1+((l.tax||0)/100)),0);return(<div key={po.id} style={{background:t.bg2,borderRadius:14,border:`1px solid ${t.bd}`,marginBottom:12,overflow:"hidden"}}>
        <div style={{padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={()=>setExpand(expand===po.id?null:po.id)}>
          <div style={{display:"flex",gap:16,alignItems:"center"}}>
            <div style={{fontSize:20}}>📦</div>
            <div><div style={{fontWeight:700,color:t.tx,fontSize:14}}>{po.num}</div><div style={{fontSize:12,color:t.tx4}}>{sup?.name||"—"} · {fmtDate(po.date)}</div></div>
          </div>
          <div style={{display:"flex",gap:16,alignItems:"center"}}>
            <Badge status={po.status}/>
            <span style={{fontWeight:800,color:t.a}}>{fmt(poTotal)}</span>
            <span style={{color:t.tx4,fontSize:14,transform:expand===po.id?"rotate(180deg)":"rotate(0)",transition:"transform .2s"}}>▾</span>
          </div>
        </div>
        {expand===po.id&&<div style={{padding:"0 20px 20px",borderTop:`1px solid ${t.bd}`}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,margin:"16px 0",fontSize:12}}>
            <div><span style={{color:t.tx4}}>Delivery: </span><b>{fmtDate(po.delivDate)||"—"}</b></div>
            <div><span style={{color:t.tx4}}>Currency: </span><b>{po.currency}</b></div>
            <div><span style={{color:t.tx4}}>Status: </span><Badge status={po.status}/></div>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr style={{background:t.bg3}}>{["Item","Qty","Unit","Unit Price","Tax","Total"].map((h,i)=><th key={i} style={{padding:"8px 12px",textAlign:i>1?"right":"left",color:t.tx4,fontWeight:700,borderBottom:`1px solid ${t.bd}`}}>{h}</th>)}</tr></thead>
            <tbody>{(po.lines||[]).map((l,i)=><tr key={i} style={{borderBottom:`1px solid ${t.bd}`}}><td style={{padding:"8px 12px"}}>{l.name||l.desc}</td><td style={{padding:"8px 12px",textAlign:"right"}}>{l.qty}</td><td style={{padding:"8px 12px",textAlign:"right"}}>{l.unit||"unit"}</td><td style={{padding:"8px 12px",textAlign:"right"}}>{fmtNum(l.price,2)}</td><td style={{padding:"8px 12px",textAlign:"right",color:t.tx4}}>{l.tax||0}%</td><td style={{padding:"8px 12px",textAlign:"right",fontWeight:700}}>{fmtNum((l.qty||0)*(l.price||0)*(1+(l.tax||0)/100),2)}</td></tr>)}</tbody>
          </table>
          <div style={{display:"flex",gap:8,marginTop:14}}>
            <Btn size="sm" variant="secondary" onClick={()=>openModal("po",po)}>✏ Edit</Btn>
            {po.status!=="Received"&&<Btn size="sm" variant="success" onClick={()=>setPos(p=>p.map(x=>x.id===po.id?{...x,status:"Received",received:true,receivedDate:today()}:x))}>✓ Mark Received</Btn>}
            <Btn size="sm" variant="danger" onClick={()=>{if(confirm(tr.confirmDelete))setPos(p=>p.filter(x=>x.id!==po.id));}}>× Delete</Btn>
          </div>
        </div>}
      </div>);})}
      {tab==="suppliers"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {cSup.map(sup=>(
          <Card key={sup.id} style={{padding:20}}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:14}}>
              <Avatar name={sup.name} size={48}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,color:t.tx,marginBottom:2}}>{sup.name}</div>
                <div style={{fontSize:12,color:t.tx3}}>{sup.contact}</div>
                <div style={{fontSize:11,color:t.tx4}}>{sup.cat} · {sup.terms} days terms</div>
              </div>
              <div style={{display:"flex",gap:2}}>{"★".repeat(sup.rating||3)}</div>
            </div>
            <div style={{fontSize:12,color:t.tx3,marginBottom:12}}>{sup.address}</div>
            <div style={{display:"flex",gap:6}}>
              <Btn size="sm" variant="primary" onClick={()=>setSelectedSupplier(sup)} style={{flex:1}}>👤 {lang==="ar"?"الملف":"Profile"}</Btn>
              <Btn size="sm" variant="secondary" onClick={()=>openModal("supplier",sup)}>✏</Btn>
              <Btn size="sm" variant="danger" onClick={()=>{if(confirm(tr.confirmDelete))setSups(p=>p.filter(x=>x.id!==sup.id));}}>×</Btn>
            </div>
          </Card>
        ))}
      </div>}
    </div>
  );
}

// ─── PRODUCTS PAGE ────────────────────────────────────────────
function ProductsPage(){
  const {t,tr,fmt,cProd,setProds,openModal}=useApp();
  const [search,setSearch]=React.useState("");
  const filtered=cProd.filter(p=>{const s=search.toLowerCase();return!s||(p.name||"").toLowerCase().includes(s)||(p.sku||"").toLowerCase().includes(s);});
  return(
    <div style={{padding:24}}>
      <PageHeader title={tr.products} icon="📦" subtitle={`${cProd.length} products`} actions={<Btn onClick={()=>openModal("product",{})} variant="primary" icon="＋">Add Product</Btn>}/>
      <div style={{marginBottom:16}}><SearchBar value={search} onChange={setSearch} placeholder="Search products..."/></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14}}>
        {filtered.map(p=>{const margin=p.salePrice>0?Math.round(((p.salePrice-p.costPrice)/p.salePrice)*100):0;const low=p.stock>0&&p.stock<=p.reorder;return(
          <Card key={p.id} style={{padding:18}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
              <div style={{padding:"8px 10px",borderRadius:10,background:`${t.a}15`,fontSize:11,fontWeight:700,color:t.a}}>{p.cat}</div>
              {low&&<Badge status="Low Stock"/>}
            </div>
            <div style={{fontSize:15,fontWeight:800,color:t.tx,marginBottom:2}}>{p.name}</div>
            <div style={{fontSize:11,color:t.tx4,marginBottom:12}}>SKU: {p.sku} · {p.unit}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              <div style={{background:t.bg3,borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:10,color:t.tx4}}>Sale Price</div><div style={{fontSize:14,fontWeight:800,color:t.a}}>{fmt(p.salePrice)}</div></div>
              <div style={{background:t.bg3,borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:10,color:t.tx4}}>Margin</div><div style={{fontSize:14,fontWeight:800,color:margin>30?"#10B981":margin>15?"#F59E0B":"#EF4444"}}>{margin}%</div></div>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{color:t.tx4}}>Stock</span><span style={{fontWeight:600,color:low?"#EF4444":t.tx}}>{p.stock} {p.unit}</span></div>
              {p.reorder>0&&<ProgressBar value={p.stock} max={Math.max(p.stock,p.reorder*3)} color={low?"#EF4444":"#10B981"} height={5}/>}
            </div>
            <div style={{display:"flex",gap:6}}>
              <Btn size="sm" variant="secondary" onClick={()=>openModal("product",p)} style={{flex:1}}>✏ Edit</Btn>
              <Btn size="sm" variant="danger" onClick={()=>{if(confirm(tr.confirmDelete))setProds(p2=>p2.filter(x=>x.id!==p.id));}}>×</Btn>
            </div>
          </Card>
        );})}
      </div>
    </div>
  );
}

// ─── STORAGE PAGE ─────────────────────────────────────────────
function StoragePage(){
  const {t,tr,fmt,cFac,cSU,setFacs,setUnits,openModal,cC}=useApp();
  const [tab,setTab]=React.useState("facilities");
  const totalRev=cSU.filter(u=>u.status==="occupied").reduce((s,u)=>s+(u.priceDay||0)*daysBetween(u.entryDate,u.exitDate||today()),0);
  return(
    <div style={{padding:24}}>
      <PageHeader title={tr.storage} icon="❄" subtitle={`${cFac.length} facilities · ${cSU.filter(u=>u.status==="occupied").length} occupied · Revenue: ${fmt(totalRev)}`} actions={<><Btn onClick={()=>openModal("facility",{})} variant="secondary" icon="＋">Add Facility</Btn><Btn onClick={()=>openModal("storageUnit",{})} variant="primary" icon="＋">Add Unit</Btn></>}/>
      <Tabs tabs={[{id:"facilities",label:"Facilities",icon:"🏭",count:cFac.length},{id:"units",label:"Storage Units",icon:"📦",count:cSU.length}]} active={tab} onChange={setTab}/>
      {tab==="facilities"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
        {cFac.map(fac=>{const units=cSU.filter(u=>u.facId===fac.id);const occ=units.filter(u=>u.status==="occupied").length;const pct=units.length>0?Math.round((occ/units.length)*100):0;return(
          <Card key={fac.id} style={{padding:20}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
              <div style={{fontSize:32}}>🏭</div><Badge status={fac.type}/>
            </div>
            <div style={{fontSize:16,fontWeight:800,color:t.tx,marginBottom:4}}>{fac.name}</div>
            <div style={{fontSize:12,color:t.tx4,marginBottom:14}}>{fac.address}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              <div style={{background:t.bg3,borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:10,color:t.tx4}}>Occupancy</div><div style={{fontSize:14,fontWeight:800,color:pct>80?"#EF4444":pct>50?"#F59E0B":"#10B981"}}>{occ}/{units.length} units</div></div>
              <div style={{background:t.bg3,borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:10,color:t.tx4}}>Temp Range</div><div style={{fontSize:13,fontWeight:700,color:"#3B82F6"}}>{fac.minTemp}°C to {fac.maxTemp}°C</div></div>
            </div>
            <ProgressBar value={occ} max={units.length||1} color={pct>80?"#EF4444":"#10B981"} showLabel/>
            <div style={{display:"flex",gap:6,marginTop:12}}>
              <Btn size="sm" variant="secondary" onClick={()=>openModal("facility",fac)} style={{flex:1}}>✏ Edit</Btn>
              <Btn size="sm" variant="primary" onClick={()=>openModal("storageUnit",{facId:fac.id})} style={{flex:1}}>＋ Unit</Btn>
            </div>
          </Card>
        );})}
      </div>}
      {tab==="units"&&<Card><Table cols={[
        {key:"name",label:"Unit",render:(v,row)=><div><div style={{fontWeight:700,color:t.tx}}>{v}</div><div style={{fontSize:11,color:t.tx4}}>{cFac.find(f=>f.id===row.facId)?.name}</div></div>},
        {key:"status",label:"Status",render:v=><Badge status={v}/>},
        {key:"clientName",label:"Client",render:v=><span style={{color:t.tx3}}>{v||"—"}</span>},
        {key:"entryDate",label:"Entry",render:v=><span style={{color:t.tx3,fontSize:12}}>{fmtDate(v)}</span>},
        {key:"exitDate",label:"Exit",render:v=><span style={{color:t.tx3,fontSize:12}}>{fmtDate(v)}</span>},
        {key:"priceDay",label:"Rate/Day",right:true,render:v=><span>{fmt(v)}</span>},
        {key:"_rev",label:"Revenue",right:true,render:(v,row)=>{const d=daysBetween(row.entryDate,row.exitDate||today());return<span style={{fontWeight:700,color:"#10B981"}}>{fmt((row.priceDay||0)*d)}</span>;}},
        {key:"temp",label:"Temp",render:v=><span style={{color:"#3B82F6",fontWeight:600}}>{v}°C</span>},
      ]} rows={cSU} actions={row=><><Btn size="sm" variant="secondary" onClick={()=>openModal("storageUnit",row)}>✏</Btn><Btn size="sm" variant="danger" onClick={()=>setUnits(p=>p.filter(x=>x.id!==row.id))}>×</Btn></>}/></Card>}
    </div>
  );
}

// ─── REPORTS PAGE ─────────────────────────────────────────────
function ReportsPage(){
  const {t,tr,fmt,cR,cE,cI,cW}=useApp();
  const months=[...new Set([...cR,...cE].map(x=>monthKey(x.date)).filter(Boolean))].sort().reverse();
  const [period,setPeriod]=React.useState(months[0]||monthKey(today()));
  const mR=cR.filter(r=>monthKey(r.date)===period).reduce((s,r)=>s+r.amount,0);
  const mE=cE.filter(e=>monthKey(e.date)===period).reduce((s,e)=>s+e.amount,0);
  const revCats=[...new Set(cR.map(r=>r.cat))].filter(Boolean);
  const expCats=[...new Set(cE.map(e=>e.cat))].filter(Boolean);
  const expenseBreakdown=expCats.map(c=>({cat:c,amt:cE.filter(e=>e.cat===c&&monthKey(e.date)===period).reduce((s,e)=>s+e.amount,0)})).filter(x=>x.amt>0).sort((a,b)=>b.amt-a.amt);
  const revenueBreakdown=revCats.map(c=>({cat:c,amt:cR.filter(r=>r.cat===c&&monthKey(r.date)===period).reduce((s,r)=>s+r.amount,0)})).filter(x=>x.amt>0).sort((a,b)=>b.amt-a.amt);
  const totalInvYTD=cI.reduce((s,i)=>s+calcInvTotal(i),0);
  const totalPaidYTD=cI.reduce((s,i)=>s+(i.paid||0),0);
  const exportXLS=()=>{
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(cR.map(r=>({Date:r.date,Description:r.description,Category:r.cat,Customer:r.customer,Amount:r.amount,Method:r.payMethod,Ref:r.ref}))),"Revenue");
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(cE.map(e=>({Date:e.date,Description:e.description,Category:e.cat,Vendor:e.vendor,Amount:e.amount,Method:e.payMethod,Ref:e.ref}))),"Expenses");
    XLSX.writeFile(wb,`MASHRO3Y-Report-${period}.xlsx`);
  };
  const colors=["#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6","#F97316","#14B8A6","#6366F1"];
  return(
    <div style={{padding:24}}>
      <PageHeader title={tr.reports} icon="📊" subtitle="Financial reports and analysis" actions={<><select value={period} onChange={e=>setPeriod(e.target.value)} style={{padding:"9px 14px",borderRadius:10,border:`1.5px solid ${t.bd}`,background:t.bg2,color:t.tx,fontSize:13,outline:"none"}}>{months.map(m=><option key={m} value={m}>{monthName(m)}</option>)}</select><Btn onClick={exportXLS} variant="secondary" icon="📥">Export Excel</Btn></>}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:20}}>
        {[{label:"Revenue",value:fmt(mR),color:"#10B981",icon:"💰"},{label:"Expenses",value:fmt(mE),color:"#EF4444",icon:"📉"},{label:"Net Profit",value:fmt(mR-mE),color:mR>mE?"#10B981":"#EF4444",icon:"📊"},{label:"Margin",value:(mR>0?Math.round(((mR-mE)/mR)*100):0)+"%",color:t.a,icon:"💹"},{label:"Total Invoiced (All)",value:fmt(totalInvYTD),color:"#3B82F6",icon:"🧾"},{label:"Total Collected",value:fmt(totalPaidYTD),color:"#8B5CF6",icon:"✅"}].map((s,i)=>(
          <div key={i} style={{background:t.bg2,borderRadius:12,padding:"14px 16px",border:`1px solid ${t.bd}`,borderTop:`3px solid ${s.color}`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:11,color:t.tx4,fontWeight:600}}>{s.label}</span><span style={{fontSize:16}}>{s.icon}</span></div>
            <div style={{fontSize:18,fontWeight:900,color:s.color}}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Section title="Revenue Breakdown" icon="💰">
          {revenueBreakdown.map((item,i)=>(
            <div key={item.cat} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:13}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{width:10,height:10,borderRadius:"50%",background:colors[i%colors.length],display:"inline-block"}}/><span style={{fontWeight:600}}>{item.cat}</span></div>
                <div style={{display:"flex",gap:10}}><span style={{color:t.tx3,fontSize:11}}>{mR>0?Math.round((item.amt/mR)*100):0}%</span><b style={{color:"#10B981"}}>{fmt(item.amt)}</b></div>
              </div>
              <ProgressBar value={item.amt} max={mR} color={colors[i%colors.length]} height={6}/>
            </div>
          ))}
          {revenueBreakdown.length===0&&<div style={{color:t.tx4,textAlign:"center",padding:20}}>No revenue in this period</div>}
        </Section>
        <Section title="Expense Breakdown" icon="📉">
          {expenseBreakdown.map((item,i)=>(
            <div key={item.cat} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:13}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{width:10,height:10,borderRadius:"50%",background:colors[i%colors.length],display:"inline-block"}}/><span style={{fontWeight:600}}>{item.cat}</span></div>
                <div style={{display:"flex",gap:10}}><span style={{color:t.tx3,fontSize:11}}>{mE>0?Math.round((item.amt/mE)*100):0}%</span><b style={{color:"#EF4444"}}>{fmt(item.amt)}</b></div>
              </div>
              <ProgressBar value={item.amt} max={mE} color={colors[i%colors.length]} height={6}/>
            </div>
          ))}
          {expenseBreakdown.length===0&&<div style={{color:t.tx4,textAlign:"center",padding:20}}>No expenses in this period</div>}
        </Section>
      </div>
    </div>
  );
}

// ─── BUDGET PAGE ──────────────────────────────────────────────
function BudgetPage(){
  const {t,tr,fmt,cB,setBuds,cR,cE,openModal,acId}=useApp();
  const yr=new Date().getFullYear();
  const bud=cB.find(b=>b.year===yr)||{months:{}};
  const months=Array.from({length:12},(_,i)=>`${yr}-${String(i+1).padStart(2,"0")}`);
  const getR=m=>cR.filter(r=>monthKey(r.date)===m).reduce((s,r)=>s+r.amount,0);
  const getE=m=>cE.filter(e=>monthKey(e.date)===m).reduce((s,e)=>s+e.amount,0);
  const varPct=(a,b)=>b>0?Math.round(((a-b)/b)*100):0;
  return(
    <div style={{padding:24}}>
      <PageHeader title={tr.budget} icon="🎯" subtitle={`Annual budget ${yr}`}/>
      <Card><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:800}}>
        <thead><tr style={{background:t.bg3}}>{["Month","Budget Rev","Actual Rev","Rev Var","Budget Exp","Actual Exp","Exp Var","Net Profit"].map((h,i)=><th key={i} style={{padding:"10px 12px",textAlign:i===0?"left":"right",color:t.tx4,fontWeight:700,borderBottom:`2px solid ${t.bd}`,fontSize:10,letterSpacing:.3}}>{h}</th>)}</tr></thead>
        <tbody>{months.map(m=>{
          const b=bud.months?.[m]||{rev:0,exp:0};const aR=getR(m);const aE=getE(m);const rVar=varPct(aR,b.rev);const eVar=varPct(aE,b.exp);const isCur=m===monthKey(today());
          return(<tr key={m} style={{borderBottom:`1px solid ${t.bd}`,background:isCur?`${t.a}08`:"transparent"}}>
            <td style={{padding:"10px 12px",fontWeight:isCur?700:400,color:isCur?t.a:t.tx}}>{monthName(m)}{isCur&&" ◀"}</td>
            <td style={{padding:"10px 12px",textAlign:"right",color:t.tx3}}>{fmt(b.rev)}</td>
            <td style={{padding:"10px 12px",textAlign:"right",fontWeight:600,color:"#10B981"}}>{fmt(aR)}</td>
            <td style={{padding:"10px 12px",textAlign:"right",fontWeight:700,color:rVar>=0?"#10B981":"#EF4444"}}>{rVar>0?"+":""}{rVar}%</td>
            <td style={{padding:"10px 12px",textAlign:"right",color:t.tx3}}>{fmt(b.exp)}</td>
            <td style={{padding:"10px 12px",textAlign:"right",fontWeight:600,color:"#EF4444"}}>{fmt(aE)}</td>
            <td style={{padding:"10px 12px",textAlign:"right",fontWeight:700,color:eVar<=0?"#10B981":"#EF4444"}}>{eVar>0?"+":""}{eVar}%</td>
            <td style={{padding:"10px 12px",textAlign:"right",fontWeight:700,color:aR-aE>0?"#10B981":"#EF4444"}}>{fmt(aR-aE)}</td>
          </tr>);
        })}</tbody>
      </table></div></Card>
    </div>
  );
}

// ─── UTILITIES PAGE ───────────────────────────────────────────
function UtilitiesPage(){
  const {t,tr,fmt,cUtils,setUtils,openModal}=useApp();
  return(
    <div style={{padding:24}}>
      <PageHeader title={tr.utilities} icon="⚡" subtitle={`${cUtils.length} readings`} actions={<Btn onClick={()=>openModal("utility",{})} variant="primary" icon="＋">Add Reading</Btn>}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {[...cUtils].sort((a,b)=>b.month.localeCompare(a.month)).map(u=>{const kwh=Math.max(0,u.currReading-u.prevReading);const bill=kwh*u.kwhRate;const total=bill+u.workerCost+u.opCost;return(
          <Card key={u.id} style={{padding:20}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
              <div style={{fontSize:24}}>⚡</div><span style={{fontWeight:700,color:t.a}}>{monthName(u.month)}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,fontSize:12,marginBottom:14}}>
              <div><div style={{color:t.tx4}}>Prev Reading</div><div style={{fontWeight:700,color:t.tx}}>{u.prevReading} kWh</div></div>
              <div><div style={{color:t.tx4}}>Curr Reading</div><div style={{fontWeight:700,color:t.tx}}>{u.currReading} kWh</div></div>
              <div><div style={{color:t.tx4}}>Consumption</div><div style={{fontWeight:700,color:"#F59E0B"}}>{kwh} kWh</div></div>
              <div><div style={{color:t.tx4}}>Rate</div><div style={{fontWeight:700,color:t.tx}}>{u.kwhRate}/kWh</div></div>
            </div>
            <div style={{borderTop:`1px solid ${t.bd}`,paddingTop:12}}>
              {[["Electricity Bill",bill],["Labor Cost",u.workerCost],["Operations Cost",u.opCost]].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{color:t.tx4}}>{l}</span><span style={{fontWeight:600}}>{fmt(v)}</span></div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",fontWeight:800,color:t.a,fontSize:14,paddingTop:8,borderTop:`1px solid ${t.bd}`,marginTop:8}}><span>Total Cost</span><span>{fmt(total)}</span></div>
            </div>
            <div style={{display:"flex",gap:6,marginTop:12}}>
              <Btn size="sm" variant="secondary" onClick={()=>openModal("utility",u)} style={{flex:1}}>✏ Edit</Btn>
              <Btn size="sm" variant="danger" onClick={()=>setUtils(p=>p.filter(x=>x.id!==u.id))}>×</Btn>
            </div>
          </Card>
        );})}
      </div>
    </div>
  );
}

// ─── AI PAGE ──────────────────────────────────────────────────
function AIPage(){
  const {t,tr,fmt,cR,cE,cI,cW,cVA,cLoans,cC}=useApp();
  const [msgs,setMsgs]=React.useState([{role:"ai",text:"Hello! I'm your AI financial assistant 🤖 Ask me anything about your business finances, employees, clients, or performance."}]);
  const [input,setInput]=React.useState("");const [loading,setLoading]=React.useState(false);
  const chips=["What's my net profit this month?","Who are my top clients?","Show payroll summary","Any overdue invoices?","Cash flow forecast","How many employees have loans?"];
  const respond=(q)=>{
    const ql=q.toLowerCase();const mR=cR.filter(r=>monthKey(r.date)===monthKey(today())).reduce((s,r)=>s+r.amount,0);const mE=cE.filter(e=>monthKey(e.date)===monthKey(today())).reduce((s,e)=>s+e.amount,0);
    if(ql.includes("profit")||ql.includes("revenue")||ql.includes("net"))return`📊 This month: Revenue ${fmt(mR)} · Expenses ${fmt(mE)} · Net Profit ${fmt(mR-mE)} · Margin ${mR>0?Math.round(((mR-mE)/mR)*100):0}%`;
    if(ql.includes("client")||ql.includes("customer")){const top=cC.slice(0,3);return`👥 You have ${cC.length} clients. Top clients: ${top.map(c=>c.name).join(", ")}. Use the Clients page for full details.`;}
    if(ql.includes("payroll")||ql.includes("salary")){const total=cW.filter(w=>w.status==="Active").reduce((s,w)=>s+w.salary,0);return`💰 Monthly payroll: ${fmt(total)} for ${cW.filter(w=>w.status==="Active").length} active employees.`;}
    if(ql.includes("overdue")||ql.includes("invoice")){const ov=cI.filter(i=>invStatus(i)==="Overdue");return ov.length>0?`⚠️ ${ov.length} overdue invoices totalling ${fmt(ov.reduce((s,i)=>s+calcInvBalance(i),0))}. Check Invoices page.`:`✅ No overdue invoices! All payments up to date.`;}
    if(ql.includes("vault")||ql.includes("cash")){const total=cVA.reduce((s,a)=>s+a.balance,0);return`🏦 Vault balance: ${fmt(total)} across ${cVA.length} accounts.`;}
    if(ql.includes("loan")){const active=cLoans.filter(l=>l.status==="Active");return`💳 ${active.length} active employee loans. Monthly deductions: ${fmt(active.reduce((s,l)=>s+l.monthlyDeduction,0))}/month.`;}
    if(ql.includes("forecast")){const avg=Array.from({length:3},(_,i)=>{const m=monthKey(new Date(new Date().setMonth(new Date().getMonth()-i)).toISOString());return cR.filter(r=>monthKey(r.date)===m).reduce((s,r)=>s+r.amount,0);}).reduce((s,v)=>s+v,0)/3;return`📈 Based on your 3-month average, projected next month revenue: ${fmt(Math.round(avg))}. Keep it up!`;}
    return`I can help with: profit analysis, client overview, payroll summary, overdue invoices, vault balance, loan status, and revenue forecasts. Try asking one of those topics!`;
  };
  const send=async(q)=>{
    const text=q||input.trim();if(!text)return;
    setMsgs(p=>[...p,{role:"user",text}]);setInput("");setLoading(true);
    await new Promise(r=>setTimeout(r,600));
    setMsgs(p=>[...p,{role:"ai",text:respond(text)}]);setLoading(false);
  };
  const ref=React.useRef(null);React.useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  return(
    <div style={{padding:24,display:"flex",flexDirection:"column",height:"calc(100vh - 56px)"}}>
      <PageHeader title="AI Financial Assistant" icon="🤖" subtitle="Ask me anything about your business"/>
      <div style={{flex:1,background:t.bg2,borderRadius:16,border:`1px solid ${t.bd}`,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{flex:1,overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:14}}>
          {msgs.map((m,i)=>(
            <div key={i} style={{display:"flex",gap:12,justifyContent:m.role==="user"?"flex-end":"flex-start",alignItems:"flex-end"}}>
              {m.role==="ai"&&<div style={{width:32,height:32,borderRadius:10,background:t.a,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🤖</div>}
              <div style={{maxWidth:"70%",padding:"12px 16px",borderRadius:14,background:m.role==="user"?t.a:t.bg3,color:m.role==="user"?"#fff":t.tx,fontSize:13,lineHeight:1.6,borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px"}}>{m.text}</div>
              {m.role==="user"&&<div style={{width:32,height:32,borderRadius:10,background:t.bg3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>👤</div>}
            </div>
          ))}
          {loading&&<div style={{display:"flex",gap:8,alignItems:"center"}}><div style={{width:32,height:32,borderRadius:10,background:t.a,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🤖</div><div style={{padding:"12px 16px",borderRadius:14,background:t.bg3,color:t.tx4,fontSize:13}}>Analyzing your data...</div></div>}
          <div ref={ref}/>
        </div>
        <div style={{padding:16,borderTop:`1px solid ${t.bd}`}}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
            {chips.map(c=><button key={c} onClick={()=>send(c)} style={{padding:"5px 12px",borderRadius:20,border:`1px solid ${t.bd}`,background:t.bg3,color:t.tx3,fontSize:11,cursor:"pointer",fontWeight:600}}>{c}</button>)}
          </div>
          <div style={{display:"flex",gap:10}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Ask about revenue, expenses, employees, invoices..." style={{flex:1,padding:"11px 16px",borderRadius:12,border:`1.5px solid ${t.bd}`,background:t.bg,color:t.tx,fontSize:13,outline:"none"}} onFocus={e=>e.target.style.borderColor=t.a} onBlur={e=>e.target.style.borderColor=t.bd}/>
            <Btn onClick={()=>send()} variant="primary" icon="→">Send</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS PAGE ────────────────────────────────────────────
function SettingsPage(){
  const {t,tr,lang,setLang,dark,setDark,accentName,setAccentName,compact,setCompact,companies,acId,openModal,showToast}=useApp();
  const co=companies.find(c=>c.id===acId)||companies[0]||{};
  const box={background:t.bg2,borderRadius:16,padding:24,boxShadow:t.sh,marginBottom:16,border:`1px solid ${t.bd}`};
  return(
    <div style={{padding:24,maxWidth:720,margin:"0 auto"}}>
      <PageHeader title={tr.settings} icon="⚙"/>
      <div style={box}>
        <div style={{fontSize:15,fontWeight:700,color:t.tx,marginBottom:18}}>🎨 {tr.appearance}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
          <div><div style={{fontSize:11,fontWeight:700,color:t.tx4,marginBottom:10,letterSpacing:.3}}>THEME</div>
            <div style={{display:"flex",gap:8}}>
              {[{id:true,label:"🌙 Dark"},{id:false,label:"☀ Light"}].map(o=><button key={o.id} onClick={()=>setDark(o.id)} style={{flex:1,padding:"10px",borderRadius:10,border:`2px solid ${dark===o.id?t.a:t.bd}`,background:dark===o.id?`${t.a}15`:t.bg3,color:dark===o.id?t.a:t.tx3,cursor:"pointer",fontWeight:700,fontSize:13}}>{o.label}</button>)}
            </div>
          </div>
          <div><div style={{fontSize:11,fontWeight:700,color:t.tx4,marginBottom:10,letterSpacing:.3}}>LANGUAGE</div>
            <div style={{display:"flex",gap:8}}>
              {[{id:"en",label:"🇬🇧 English"},{id:"ar",label:"🇦🇪 العربية"}].map(o=><button key={o.id} onClick={()=>setLang(o.id)} style={{flex:1,padding:"10px",borderRadius:10,border:`2px solid ${lang===o.id?t.a:t.bd}`,background:lang===o.id?`${t.a}15`:t.bg3,color:lang===o.id?t.a:t.tx3,cursor:"pointer",fontWeight:700,fontSize:13}}>{o.label}</button>)}
            </div>
          </div>
        </div>
        <div style={{fontSize:11,fontWeight:700,color:t.tx4,marginBottom:10,letterSpacing:.3}}>ACCENT COLOR</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {Object.entries(ACCENTS).map(([name,ac])=><button key={name} onClick={()=>setAccentName(name)} style={{width:36,height:36,borderRadius:10,background:ac.ag,border:`3px solid ${accentName===name?"#fff":"transparent"}`,cursor:"pointer",boxShadow:accentName===name?"0 0 0 3px "+ac.a:"none",transition:"all .15s"}} title={name}/>)}
        </div>
      </div>
      <div style={box}>
        <div style={{fontSize:15,fontWeight:700,color:t.tx,marginBottom:16}}>🏢 Active Company</div>
        <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:14}}>
          <div style={{width:48,height:48,borderRadius:12,background:co.color||t.a,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:"#fff"}}>{co.logo}</div>
          <div><div style={{fontSize:16,fontWeight:800,color:t.tx}}>{co.name}</div><div style={{fontSize:12,color:t.tx4}}>{co.type} · {co.currency} · {co.tax}% tax</div></div>
        </div>
        <Btn onClick={()=>openModal("company",co)} variant="secondary" icon="✏">Edit Company</Btn>
      </div>
      <div style={box}>
        <div style={{fontSize:15,fontWeight:700,color:t.tx,marginBottom:16}}>💾 Data Management</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <Btn onClick={()=>{const data={};Object.keys(localStorage).filter(k=>k.startsWith("m3y_v7")).forEach(k=>{data[k]=JSON.parse(localStorage.getItem(k));});const b=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(b);const a=document.createElement("a");a.href=url;a.download="MASHRO3Y-backup-"+today()+".json";a.click();}} variant="secondary" icon="📤">Export Backup</Btn>
          <Btn onClick={()=>{if(confirm("This will RESET ALL DATA. Are you sure?")){Object.keys(localStorage).filter(k=>k.startsWith("m3y_v7")).forEach(k=>localStorage.removeItem(k));window.location.reload();}}} variant="danger" icon="🗑">Reset All Data</Btn>
        </div>
      </div>
      <div style={box}>
        <div style={{fontSize:15,fontWeight:700,color:t.tx,marginBottom:8}}>ℹ About MASHRO3Y</div>
        <div style={{fontSize:13,color:t.tx4,lineHeight:1.8}}>Version 8.2 Enterprise · Multi-company ERP · Full HR & Payroll · CRM Pipeline · Invoice & Quotes · Procurement · Cold Storage · AI Assistant · Bilingual EN/AR</div>
      </div>
    </div>
  );
}

// ─── COMPANIES PAGE ───────────────────────────────────────────
function CompaniesPage(){
  const {t,tr,companies,acId,setAcId,setCompanies,openModal}=useApp();
  return(
    <div style={{padding:24}}>
      <PageHeader title={tr.companies} icon="🏢" subtitle={`${companies.length} companies`} actions={<Btn onClick={()=>openModal("company",{})} variant="primary" icon="＋">Add Company</Btn>}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
        {companies.map(co=>(
          <Card key={co.id} style={{padding:22,borderTop:`4px solid ${co.color||t.a}`}}>
            <div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:16}}>
              <div style={{width:52,height:52,borderRadius:12,background:co.color||t.a,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:"#fff"}}>{co.logo}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:900,color:t.tx,marginBottom:2}}>{co.name}</div>
                <div style={{fontSize:12,color:t.tx3}}>{co.type} · {co.currency}</div>
                <div style={{fontSize:11,color:t.tx4}}>{co.address}</div>
              </div>
              {acId===co.id&&<Badge status="Active" size="md"/>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14,fontSize:12}}>
              <div><span style={{color:t.tx4}}>Tax Rate: </span><b>{co.tax}%</b></div>
              <div><span style={{color:t.tx4}}>Tax #: </span><span style={{color:t.tx3}}>{co.taxNum||"—"}</span></div>
              {co.phone&&<div><span style={{color:t.tx4}}>Phone: </span><span>{co.phone}</span></div>}
              {co.email&&<div><span style={{color:t.tx4}}>Email: </span><span>{co.email}</span></div>}
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={()=>setAcId(co.id)} variant={acId===co.id?"primary":"secondary"} size="sm" style={{flex:1}}>{acId===co.id?"Active ✓":"Switch To"}</Btn>
              <Btn onClick={()=>openModal("company",co)} variant="ghost" size="sm">✏</Btn>
              {companies.length>1&&<Btn onClick={()=>{if(confirm(tr.confirmDelete))setCompanies(p=>p.filter(x=>x.id!==co.id));}} variant="danger" size="sm">×</Btn>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  MASHRO3Y v7 — ALL MODALS
// ═══════════════════════════════════════════════════════════
function AllModals(){
  const {t,tr,modal,modalData,closeModal,showToast,fmt,acId,
    cC,cSup,cVA,cW,cProd,cFac,
    setRevs,setExps,setInvs,setClis,setQuotes,
    setVAccs,setVTxs,setWorkers,setAbsences,setSalaries,
    setLeaveReq,setOT,setLoans,setAdv,
    setSups,setPos,setUtils,setFacs,setUnits,setProds,
    setCompanies,setCRM,companies,
  }=useApp();
  const [form,setForm]=React.useState({});
  const [lines,setLines]=React.useState([]);
  const sf=React.useCallback((k,v)=>setForm(p=>({...p,[k]:v})),[]);
  const fCtxVal=React.useMemo(()=>({form,sf}),[form,sf]);
  React.useEffect(()=>{
    if(modal&&modalData&&modalData.id){
      setForm({...modalData});
      if(["invoice","quote","po"].includes(modal)&&modalData.lines)setLines(modalData.lines);
    } else {
      setForm(modalData||{});
      if(["invoice","quote"].includes(modal))setLines([{id:uid(),desc:"",qty:1,price:0,tax:5,discount:0}]);
      else if(modal==="po")setLines([{id:uid(),desc:"",qty:1,unit:"unit",price:0,tax:0}]);
      else setLines([]);
    }
  },[modal,modalData]);
  if(!modal)return null;
  const isEdit=!!(modalData&&modalData.id);

  const wOpts=cW.map(w=>({value:w.id,label:w.name+" — "+w.role}));
  const cOpts=cC.map(c=>({value:c.id,label:c.name+(c.company?" ("+c.company+")":"")}));
  const supOpts=cSup.map(s=>({value:s.id,label:s.name}));
  const accOpts=cVA.map(a=>({value:a.id,label:a.name}));
  const facOpts=cFac.map(f=>({value:f.id,label:f.name}));

  const save=()=>{
    const r=k=>form[k];
    if(modal==="revenue"){
      if(!r("amount")||!r("description")){showToast(tr.fillRequired,"error");return;}
      const item={id:isEdit?r("id"):uid(),cId:acId,amount:+r("amount"),cat:r("cat")||"Sales",description:r("description"),date:r("date")||today(),payMethod:r("payMethod")||"Bank Transfer",customer:r("customer")||"",customerId:r("customerId")||"",ref:r("ref")||"",notes:r("notes")||"",costCenter:r("costCenter")||""};
      setRevs(p=>isEdit?p.map(x=>x.id===item.id?item:x):[...p,item]);
    } else if(modal==="expense"){
      if(!r("amount")||!r("description")){showToast(tr.fillRequired,"error");return;}
      const item={id:isEdit?r("id"):uid(),cId:acId,amount:+r("amount"),cat:r("cat")||"Other",description:r("description"),date:r("date")||today(),payMethod:r("payMethod")||"Bank Transfer",vendor:r("vendor")||"",ref:r("ref")||"",notes:r("notes")||"",costCenter:r("costCenter")||""};
      setExps(p=>isEdit?p.map(x=>x.id===item.id?item:x):[...p,item]);
    } else if(modal==="invoice"||modal==="quote"){
      if(!r("clientName")||!lines.filter(l=>l.desc).length){showToast(tr.fillRequired,"error");return;}
      const vl=lines.filter(l=>l.desc);
      const base={id:isEdit?r("id"):uid(),cId:acId,num:r("num")||(modal==="invoice"?"INV-":"QUO-")+new Date().getFullYear()+"-"+uid().slice(-3),clientId:r("clientId")||"",clientName:r("clientName"),clientEmail:r("clientEmail")||"",clientAddress:r("clientAddress")||"",date:r("date")||today(),payTerms:r("payTerms")||"Net 30",currency:r("currency")||"AED",lines:vl,notes:r("notes")||""};
      if(modal==="invoice"){setInvs(p=>isEdit?p.map(x=>x.id===base.id?{...base,status:r("status")||"Draft",dueDate:r("dueDate")||"",paid:+r("paid")||0,paidDate:r("paidDate")||"",payMethod:r("payMethod")||"",payRef:r("payRef")||""}:x):[...p,{...base,status:r("status")||"Draft",dueDate:r("dueDate")||"",paid:0,paidDate:"",payMethod:"",payRef:""}]);}
      else{setQuotes(p=>isEdit?p.map(x=>x.id===base.id?{...base,validUntil:r("validUntil")||"",status:r("status")||"Sent",convertedToInvoice:false}:x):[...p,{...base,validUntil:r("validUntil")||"",status:r("status")||"Sent",convertedToInvoice:false}]);}
    } else if(modal==="payment"){
      const inv=modalData;const amt=+r("payAmt")||calcInvBalance(inv);
      setInvs(p=>p.map(x=>x.id===inv.id?{...x,paid:(x.paid||0)+amt,paidDate:r("payDate")||today(),payMethod:r("payMethod")||"Bank Transfer",payRef:r("payRef")||"",status:(x.paid||0)+amt>=calcInvTotal(x)?"Paid":"Partial"}:x));
      setRevs(p=>[...p,{id:uid(),cId:acId,amount:amt,cat:"Sales",description:"Payment — "+inv.num+" ("+inv.clientName+")",date:r("payDate")||today(),payMethod:r("payMethod")||"",customer:inv.clientName,customerId:inv.clientId||"",ref:inv.num,notes:"",costCenter:"Sales"}]);
      showToast("Payment registered ✓","success");closeModal();return;
    } else if(modal==="client"){
      if(!r("name")){showToast(tr.fillRequired,"error");return;}
      const item={id:isEdit?r("id"):uid(),cId:acId,name:r("name"),company:r("company")||"",phone:r("phone")||"",email:r("email")||"",address:r("address")||"",currency:r("currency")||"AED",creditLimit:+r("creditLimit")||0,tags:(r("tags")||"").split(",").map(s=>s.trim()).filter(Boolean),notes:r("notes")||"",photo:"",nationality:r("nationality")||"",website:r("website")||"",contactPerson:r("name"),position:r("position")||""};
      setClis(p=>isEdit?p.map(x=>x.id===item.id?item:x):[...p,item]);
    } else if(modal==="worker"){
      if(!r("name")||!r("salary")){showToast(tr.fillRequired,"error");return;}
      const item={id:isEdit?r("id"):uid(),cId:acId,name:r("name"),role:r("role")||"",dept:r("dept")||"Operations",salary:+r("salary"),startDate:r("startDate")||today(),status:r("status")||"Active",email:r("email")||"",phone:r("phone")||"",nationality:r("nationality")||"",idNum:r("idNum")||"",passportNum:r("passportNum")||"",insurancePolicy:r("insurancePolicy")||"",insuranceExpiry:r("insuranceExpiry")||"",leaveEntitlement:+r("leaveEntitlement")||30,photo:"",notes:r("notes")||"",emergencyContact:r("emergencyContact")||"",gender:r("gender")||"",dob:r("dob")||""};
      setWorkers(p=>isEdit?p.map(x=>x.id===item.id?item:x):[...p,item]);
    } else if(modal==="absence"){
      if(!r("wId")||!r("date")){showToast(tr.fillRequired,"error");return;}
      setAbsences(p=>[...p,{id:uid(),cId:acId,wId:r("wId"),date:r("date"),type:r("type")||"Absent",paid:r("paid")==="true",approved:true,notes:r("notes")||"",hours:+r("hours")||9}]);
    } else if(modal==="leaveRequest"){
      if(!r("wId")||!r("startDate")||!r("endDate")){showToast(tr.fillRequired,"error");return;}
      const days=daysBetween(r("startDate"),r("endDate"))+1;
      setLeaveReq(p=>[...p,{id:uid(),cId:acId,wId:r("wId"),type:r("type")||"Annual Leave",startDate:r("startDate"),endDate:r("endDate"),days,status:"Pending",approvedBy:"",requestDate:today(),notes:r("notes")||""}]);
    } else if(modal==="overtime"){
      if(!r("wId")||!r("hours")){showToast(tr.fillRequired,"error");return;}
      setOT(p=>[...p,{id:uid(),cId:acId,wId:r("wId"),date:r("date")||today(),hours:+r("hours"),type:r("type")||"Regular (1.25x)",reason:r("reason")||"",approved:false,amount:0}]);
    } else if(modal==="workerLoan"){
      if(!r("wId")||!r("amount")||!r("monthlyDeduction")){showToast(tr.fillRequired,"error");return;}
      setLoans(p=>[...p,{id:uid(),cId:acId,wId:r("wId"),amount:+r("amount"),monthlyDeduction:+r("monthlyDeduction"),startDate:r("startDate")||today(),reason:r("reason")||"",status:"Active",approvedBy:r("approvedBy")||"Management",approvedDate:today(),notes:r("notes")||""}]);
    } else if(modal==="workerAdvance"){
      if(!r("wId")||!r("amount")){showToast(tr.fillRequired,"error");return;}
      setAdv(p=>[...p,{id:uid(),cId:acId,wId:r("wId"),amount:+r("amount"),date:today(),deductMonth:r("deductMonth")||monthKey(today()),reason:r("reason")||"",status:"Pending",approvedBy:"",notes:""}]);
    } else if(modal==="vaultAcc"){
      if(!r("name")){showToast(tr.fillRequired,"error");return;}
      const item={id:isEdit?r("id"):uid(),cId:acId,name:r("name"),bank:r("bank")||"",number:r("number")||"",type:r("type")||"Corporate",balance:+r("balance")||0,currency:r("currency")||"AED",notes:r("notes")||""};
      setVAccs(p=>isEdit?p.map(x=>x.id===item.id?item:x):[...p,item]);
    } else if(modal==="vaultTx"){
      if(!r("accId")||!r("amount")){showToast(tr.fillRequired,"error");return;}
      const item={id:uid(),cId:acId,accId:r("accId"),type:r("type")||"in",amount:+r("amount"),desc:r("desc")||"",date:r("date")||today(),cat:r("cat")||"Other",ref:r("ref")||""};
      setVTxs(p=>[...p,item]);
      setVAccs(p=>p.map(a=>a.id===item.accId?{...a,balance:a.balance+(item.type==="in"?item.amount:-item.amount)}:a));
      showToast(tr.saved,"success");closeModal();return;
    } else if(modal==="supplier"){
      if(!r("name")){showToast(tr.fillRequired,"error");return;}
      const item={id:isEdit?r("id"):uid(),cId:acId,name:r("name"),contact:r("contact")||"",email:r("email")||"",phone:r("phone")||"",cat:r("cat")||"Other",terms:+r("terms")||30,currency:r("currency")||"AED",address:r("address")||"",taxNum:r("taxNum")||"",notes:r("notes")||"",rating:+r("rating")||3,bankDetails:r("bankDetails")||""};
      setSups(p=>isEdit?p.map(x=>x.id===item.id?item:x):[...p,item]);
    } else if(modal==="po"){
      if(!r("num")){showToast(tr.fillRequired,"error");return;}
      const item={id:isEdit?r("id"):uid(),cId:acId,num:r("num"),supId:r("supId")||"",date:r("date")||today(),delivDate:r("delivDate")||"",status:r("status")||"Draft",currency:r("currency")||"AED",lines:lines.filter(l=>l.desc).map(l=>({name:l.desc,qty:l.qty,unit:l.unit||"unit",price:l.price,tax:l.tax||0})),notes:r("notes")||"",received:false,receivedDate:""};
      setPos(p=>isEdit?p.map(x=>x.id===item.id?item:x):[...p,item]);
    } else if(modal==="utility"){
      if(!r("month")){showToast(tr.fillRequired,"error");return;}
      const kwh=Math.max(0,+r("currReading")-(+r("prevReading")||0));
      const bill=+(kwh*(+r("kwhRate")||0.38)).toFixed(2);
      const item={id:isEdit?r("id"):uid(),cId:acId,month:r("month"),prevReading:+r("prevReading")||0,currReading:+r("currReading")||0,kwhRate:+r("kwhRate")||0.38,workerCost:+r("workerCost")||0,opCost:+r("opsCost")||0,notes:r("notes")||""};
      setUtils(p=>isEdit?p.map(x=>x.id===item.id?item:x):[...p,item]);
      if(!isEdit&&bill>0){setExps(p=>[...p,{id:uid(),cId:acId,amount:bill,cat:"Electricity",description:"Electricity — "+r("month"),date:today(),payMethod:"Bank Transfer",vendor:"Utility Provider",ref:"UTIL-"+r("month"),notes:"Auto",costCenter:"Admin"}]);}
    } else if(modal==="product"){
      if(!r("name")){showToast(tr.fillRequired,"error");return;}
      const item={id:isEdit?r("id"):uid(),cId:acId,name:r("name"),sku:r("sku")||"SKU-"+uid().slice(-4),cat:r("cat")||"Other",costPrice:+r("costPrice")||0,salePrice:+r("salePrice")||0,stock:+r("stock")||0,reorder:+r("reorder")||0,unit:r("unit")||"unit",notes:r("notes")||"",barcode:r("barcode")||""};
      setProds(p=>isEdit?p.map(x=>x.id===item.id?item:x):[...p,item]);
    } else if(modal==="company"){
      if(!r("name")){showToast(tr.fillRequired,"error");return;}
      const item={id:isEdit?r("id"):uid(),name:r("name"),currency:r("currency")||"AED",logo:(r("name")||"").slice(0,2).toUpperCase(),tax:+r("tax")||5,color:r("color")||"#3B82F6",type:r("type")||"Trading",address:r("address")||"",taxNum:r("taxNum")||"",phone:r("phone")||"",email:r("email")||"",website:r("website")||"",bankName:r("bankName")||"",bankIBAN:r("bankIBAN")||"",bankSwift:r("bankSwift")||"",bankBranch:r("bankBranch")||"",invoiceFooter:r("invoiceFooter")||"",invoicePayInstructions:r("invoicePayInstructions")||"",archived:false,fiscalYearStart:"01",workingDays:["Mon","Tue","Wed","Thu","Fri"],dailyWorkHours:9,leaveEntitlement:30};
      setCompanies(p=>isEdit?p.map(x=>x.id===item.id?item:x):[...p,item]);
    } else if(modal==="crmLead"){
      if(!r("company")){showToast(tr.fillRequired,"error");return;}
      const item={id:isEdit?r("id"):uid(),cId:acId,name:r("name")||"",company:r("company"),email:r("email")||"",phone:r("phone")||"",stage:r("stage")||"Lead",dealValue:+r("dealValue")||0,probability:+r("probability")||20,assignedTo:r("assignedTo")||"",lastActivity:today(),nextFollowUp:r("nextFollowUp")||"",notes:r("notes")||"",currency:r("currency")||"AED",source:r("source")||"Other"};
      setCRM(p=>isEdit?p.map(x=>x.id===item.id?item:x):[...p,item]);
    } else if(modal==="facility"){
      if(!r("name")){showToast(tr.fillRequired,"error");return;}
      const item={id:isEdit?r("id"):uid(),cId:acId,name:r("name"),type:r("type")||"General",capacity:+r("capacity")||0,address:r("address")||"",minTemp:+r("minTemp")||0,maxTemp:+r("maxTemp")||35,notes:r("notes")||"",monthlyRate:+r("monthlyRate")||0};
      setFacs(p=>isEdit?p.map(x=>x.id===item.id?item:x):[...p,item]);
    } else if(modal==="storageUnit"){
      if(!r("name")){showToast(tr.fillRequired,"error");return;}
      const cl=cC.find(c=>c.id===r("clientId"));
      const item={id:isEdit?r("id"):uid(),cId:acId,facId:r("facId")||"",name:r("name"),clientId:r("clientId")||"",clientName:cl?cl.name:"",entryDate:r("entryDate")||"",exitDate:r("exitDate")||"",capacity:+r("capacity")||0,stored:+r("stored")||0,priceDay:+r("priceDay")||0,status:r("clientId")?"occupied":"available",temp:+r("temp")||20,notes:r("notes")||""};
      setUnits(p=>isEdit?p.map(x=>x.id===item.id?item:x):[...p,item]);
    }
    showToast(tr.saved,"success");closeModal();
  };

  const titles={
    revenue:isEdit?"Edit Revenue":"Add Revenue",expense:isEdit?"Edit Expense":"Add Expense",
    invoice:isEdit?"Edit Invoice":"New Invoice",quote:isEdit?"Edit Quote":"New Quote",
    payment:"Register Payment",client:isEdit?"Edit Client":"Add Client",
    worker:isEdit?"Edit Employee":"Add Employee",absence:"Mark Absence",
    leaveRequest:"Leave Request",overtime:"Log Overtime",
    workerLoan:"Employee Loan",workerAdvance:"Salary Advance",
    vaultAcc:isEdit?"Edit Account":"Add Account",vaultTx:"New Transaction",
    supplier:isEdit?"Edit Supplier":"Add Supplier",po:isEdit?"Edit PO":"Create Purchase Order",
    utility:isEdit?"Edit Utility":"Add Meter Reading",product:isEdit?"Edit Product":"Add Product",
    company:isEdit?"Edit Company":"Add Company",crmLead:isEdit?"Edit Deal":"Add Deal",
    facility:isEdit?"Edit Facility":"Add Facility",storageUnit:isEdit?"Edit Unit":"Add Storage Unit",
    payslip:"Payslip Preview",
  };
  const widths={invoice:780,quote:780,po:780,payslip:720};

  const renderPayslip=()=>{
    const {worker,wSal,wAbs,wOT,wLoans,wAdv}=modalData||{};
    if(!worker)return null;
    const co=companies.find(c=>c.id===acId)||companies[0]||{};
    const month=monthKey(today());
    const sal=wSal?.find(s=>s.month===month)||{base:worker.salary,loanDeduction:0,absenceDeduction:0,overtimeAdd:0,net:worker.salary,paid:false};
    return(
      <div style={{background:"#fff",color:"#111",padding:32,fontFamily:"Arial,sans-serif"}}>
        <div style={{display:"flex",justifyContent:"space-between",borderBottom:"2px solid #E5E7EB",paddingBottom:16,marginBottom:20}}>
          <div>
            <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:4}}>PAYSLIP</div>
            <div style={{fontSize:20,fontWeight:900}}>{co.name}</div>
            <div style={{fontSize:12,color:"#555"}}>{co.address}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:14,fontWeight:700}}>{monthName(month)}</div>
            <div style={{fontSize:12,color:"#888"}}>Employee Payslip</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20,padding:16,background:"#F8FAFF",borderRadius:10}}>
          <div><div style={{fontSize:10,color:"#888",marginBottom:2}}>EMPLOYEE</div><div style={{fontWeight:700,fontSize:16}}>{worker.name}</div><div style={{fontSize:12,color:"#555"}}>{worker.role} — {worker.dept}</div></div>
          <div><div style={{fontSize:10,color:"#888",marginBottom:2}}>DETAILS</div><div style={{fontSize:12}}><div>Start Date: {fmtDate(worker.startDate)}</div><div>Status: {worker.status}</div></div></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:"#10B981",marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Earnings</div>
            {[["Base Salary",sal.base],["Overtime",sal.overtimeAdd||0],["Commission",sal.commissionAdd||0],["Other Additions",sal.otherAdd||0]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #F0F4FF",fontSize:13}}>
                <span style={{color:"#555"}}>{l}</span><span style={{fontWeight:600}}>{fmtNum(v,2)}</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",fontWeight:700,color:"#10B981",fontSize:14}}>
              <span>Gross Pay</span><span>{fmtNum(sal.base+(sal.overtimeAdd||0)+(sal.commissionAdd||0)+(sal.otherAdd||0),2)}</span>
            </div>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:"#EF4444",marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Deductions</div>
            {[["Absence Deduction",sal.absenceDeduction||0],["Loan Deduction",sal.loanDeduction||0],["Advance Deduction",sal.advanceDeduction||0],["Other Deductions",sal.otherDeduct||0]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #F0F4FF",fontSize:13}}>
                <span style={{color:"#555"}}>{l}</span><span style={{fontWeight:600,color:v>0?"#EF4444":"#888"}}>-{fmtNum(v,2)}</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",fontWeight:700,color:"#EF4444",fontSize:14}}>
              <span>Total Deductions</span><span>-{fmtNum((sal.absenceDeduction||0)+(sal.loanDeduction||0)+(sal.advanceDeduction||0)+(sal.otherDeduct||0),2)}</span>
            </div>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:"16px 20px",background:"#1E293B",borderRadius:10,color:"#fff"}}>
          <span style={{fontSize:16,fontWeight:700}}>NET PAY</span>
          <span style={{fontSize:22,fontWeight:900}}>{fmtNum(sal.net,2)} {co.currency}</span>
        </div>
        <div style={{marginTop:16,fontSize:11,color:"#888",textAlign:"center"}}>Generated {fmtDate(today())} · {sal.paid?"PAID ✓":"PENDING"}</div>
      </div>
    );
  };

  return(
    <FormCtx.Provider value={fCtxVal}>
    <Modal title={titles[modal]||modal} onClose={closeModal} width={widths[modal]||520} noPad={modal==="payslip"}
      footer={modal!=="payslip"&&<>
        <Btn onClick={closeModal} variant="ghost">{tr.cancel}</Btn>
        <Btn onClick={save} variant="primary">{isEdit?tr.save:tr.add}</Btn>
      </>}>
      {modal==="revenue"&&<><FG><F fk="amount" label="Amount *" type="number" placeholder="0.00"/><F fk="cat" label="Category" type="select" options={tr.revCats}/></FG><F fk="description" label="Description *" placeholder="Invoice payment, consulting fee..."/><FG><F fk="customer" label="Customer"/><F fk="date" label="Date" type="date"/></FG><FG><F fk="payMethod" label="Payment Method" type="select" options={tr.payMethodsList}/><F fk="ref" label="Reference #"/></FG><FG><F fk="costCenter" label="Cost Center"/><F fk="notes" label="Notes"/></FG></>}
      {modal==="expense"&&<><FG><F fk="amount" label="Amount *" type="number" placeholder="0.00"/><F fk="cat" label="Category" type="select" options={tr.expCats}/></FG><F fk="description" label="Description *" placeholder="Office rent, software license..."/><FG><F fk="vendor" label="Vendor / Supplier"/><F fk="date" label="Date" type="date"/></FG><FG><F fk="payMethod" label="Payment Method" type="select" options={tr.payMethodsList}/><F fk="ref" label="Reference #"/></FG><FG><F fk="costCenter" label="Cost Center"/><F fk="notes" label="Notes"/></FG></>}
      {(modal==="invoice"||modal==="quote")&&<><FG><F fk="num" label={modal==="invoice"?"Invoice #":"Quote #"} placeholder={modal==="invoice"?"INV-2026-001":"QUO-2026-001"}/><F fk="status" label="Status" type="select" options={modal==="invoice"?["Draft","Confirmed","Sent"]:["Draft","Sent","Expired"]}/></FG><F fk="clientName" label="Client Name *" placeholder="Client or company name"/><FG cols={3}><F fk="clientEmail" label="Email" type="email"/><F fk="clientAddress" label="Address"/><F fk="currency" label="Currency" type="select" options={tr.currencies}/></FG><FG cols={3}><F fk="date" label={modal==="invoice"?"Issue Date":"Quote Date"} type="date"/>{modal==="invoice"?<F fk="dueDate" label="Due Date" type="date"/>:<F fk="validUntil" label="Valid Until" type="date"/>}<F fk="payTerms" label="Payment Terms" type="select" options={tr.payTermsList}/></FG><LineItemsEditor lines={lines} onChange={setLines} products={cProd}/><F fk="notes" label="Notes / Payment Instructions" type="textarea" rows={2}/></>}
      {modal==="payment"&&(()=>{const inv=modalData||{};const bal=calcInvBalance(inv);return<><div style={{padding:"14px 16px",background:t.bg3,borderRadius:10,marginBottom:16}}><div style={{fontWeight:700,color:t.tx,marginBottom:8}}>{inv.num} — {inv.clientName}</div><div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}><span style={{color:t.tx3}}>Invoice Total:</span><b>{fmtNum(calcInvTotal(inv),2)}</b></div><div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}><span style={{color:t.tx3}}>Already Paid:</span><span style={{color:"#10B981"}}>{fmtNum(inv.paid||0,2)}</span></div><div style={{display:"flex",justifyContent:"space-between",fontSize:15,paddingTop:8,borderTop:`1px solid ${t.bd}`}}><b style={{color:"#EF4444"}}>Balance Due:</b><b style={{color:"#EF4444"}}>{fmtNum(bal,2)}</b></div></div><F fk="payAmt" label="Payment Amount" type="number" placeholder={bal.toFixed(2)}/><FG><F fk="payDate" label="Payment Date" type="date"/><F fk="payMethod" label="Method" type="select" options={tr.payMethodsList}/></FG><F fk="payRef" label="Reference / Bank Ref" placeholder="TRF-001"/></>;})()}
      {modal==="client"&&<><FG><F fk="name" label="Contact Name *" placeholder="John Smith"/><F fk="company" label="Company" placeholder="ABC Corp"/></FG><FG><F fk="position" label="Job Title" placeholder="CEO"/><F fk="nationality" label="Nationality"/></FG><FG><F fk="phone" label="Phone" type="tel"/><F fk="email" label="Email" type="email"/></FG><FG><F fk="website" label="Website"/><F fk="currency" label="Currency" type="select" options={tr.currencies}/></FG><FG><F fk="creditLimit" label="Credit Limit" type="number" placeholder="100000"/><F fk="tags" label="Tags (comma separated)" placeholder="VIP, Enterprise"/></FG><F fk="address" label="Address"/><F fk="notes" label="Notes" type="textarea" rows={2}/></>}
      {modal==="worker"&&<><FG><F fk="name" label="Full Name *" placeholder="Ahmed Ali"/><F fk="role" label="Job Title" placeholder="Operations Manager"/></FG><FG cols={3}><F fk="dept" label="Department" type="select" options={tr.workerDepts}/><F fk="salary" label="Base Salary *" type="number" placeholder="8000"/><F fk="status" label="Status" type="select" options={tr.workerStatuses}/></FG><FG cols={3}><F fk="startDate" label="Start Date" type="date"/><F fk="gender" label="Gender" type="select" options={["Male","Female"]}/><F fk="dob" label="Date of Birth" type="date"/></FG><FG><F fk="phone" label="Phone" type="tel"/><F fk="email" label="Work Email" type="email"/></FG><FG><F fk="nationality" label="Nationality"/><F fk="leaveEntitlement" label="Annual Leave Days" type="number" placeholder="30"/></FG><FG><F fk="idNum" label="Emirates ID / National ID"/><F fk="passportNum" label="Passport Number"/></FG><FG><F fk="insurancePolicy" label="Insurance Policy #"/><F fk="insuranceExpiry" label="Insurance Expiry" type="date"/></FG><F fk="emergencyContact" label="Emergency Contact (Name + Phone)"/><F fk="notes" label="Notes" type="textarea" rows={2}/></>}
      {modal==="absence"&&<><F fk="wId" label="Employee *" type="select" options={wOpts}/><FG cols={3}><F fk="date" label="Date *" type="date"/><F fk="type" label="Type" type="select" options={tr.absenceTypes}/><F fk="hours" label="Hours" type="number" placeholder="9"/></FG><FG><F fk="paid" label="Paid Leave?" type="select" options={[{value:"true",label:"Yes — Paid"},{value:"false",label:"No — Unpaid"}]}/><F fk="notes" label="Notes / Reason"/></FG></>}
      {modal==="leaveRequest"&&<><F fk="wId" label="Employee *" type="select" options={wOpts}/><FG><F fk="type" label="Leave Type" type="select" options={tr.leaveTypes}/><F fk="startDate" label="From *" type="date"/></FG><FG><F fk="endDate" label="To *" type="date"/><div style={{paddingTop:20,fontSize:13,color:t.tx3}}>{form.startDate&&form.endDate?`→ ${daysBetween(form.startDate,form.endDate)+1} day(s)`:""}</div></FG><F fk="notes" label="Reason" type="textarea" rows={2}/></>}
      {modal==="overtime"&&<><F fk="wId" label="Employee *" type="select" options={wOpts}/><FG cols={3}><F fk="date" label="Date *" type="date"/><F fk="hours" label="Hours *" type="number" placeholder="3"/><F fk="type" label="Type" type="select" options={tr.overtimeTypes}/></FG><F fk="reason" label="Reason" placeholder="Project deadline, month-end closing..."/></>}
      {modal==="workerLoan"&&<><F fk="wId" label="Employee *" type="select" options={wOpts}/><FG><F fk="amount" label="Loan Amount *" type="number" placeholder="20000"/><F fk="monthlyDeduction" label="Monthly Deduction *" type="number" placeholder="2000"/></FG>{form.amount&&form.monthlyDeduction&&+form.monthlyDeduction>0&&<div style={{padding:"10px 14px",background:t.bg3,borderRadius:10,fontSize:13,color:t.tx3,marginBottom:14}}>⏱ Duration: ~{Math.ceil(+form.amount/+form.monthlyDeduction)} months</div>}<FG><F fk="startDate" label="First Deduction Month" type="date"/><F fk="approvedBy" label="Approved By" placeholder="HR Manager"/></FG><F fk="reason" label="Reason *" placeholder="Medical emergency, home renovation..."/><F fk="notes" label="Notes" type="textarea" rows={2}/></>}
      {modal==="workerAdvance"&&<><F fk="wId" label="Employee *" type="select" options={wOpts}/><FG><F fk="amount" label="Advance Amount *" type="number" placeholder="3000"/><F fk="deductMonth" label="Deduct Month (YYYY-MM)" placeholder={monthKey(today())}/></FG><F fk="reason" label="Reason *" placeholder="Emergency, travel expenses..."/></>}
      {modal==="vaultAcc"&&<><FG><F fk="name" label="Account Name *" placeholder="Main Cash Box"/><F fk="bank" label="Bank Name" placeholder="Emirates NBD"/></FG><FG cols={3}><F fk="type" label="Type" type="select" options={tr.bankTypes}/><F fk="currency" label="Currency" type="select" options={tr.currencies}/><F fk="balance" label="Opening Balance" type="number"/></FG><F fk="number" label="IBAN / Account #" placeholder="AE07033..."/><F fk="notes" label="Notes" type="textarea" rows={2}/></>}
      {modal==="vaultTx"&&<><F fk="accId" label="Account *" type="select" options={accOpts}/><FG><F fk="type" label="Type" type="select" options={[{value:"in",label:"💚 Deposit / Receive"},{value:"out",label:"🔴 Withdrawal / Payment"}]}/><F fk="amount" label="Amount *" type="number" placeholder="0.00"/></FG><F fk="desc" label="Description *" placeholder="Reason for transaction"/><FG cols={3}><F fk="date" label="Date" type="date"/><F fk="cat" label="Category" type="select" options={[...tr.revCats,...tr.expCats]}/><F fk="ref" label="Reference #"/></FG></>}
      {modal==="supplier"&&<><FG><F fk="name" label="Supplier Name *" placeholder="TechSupply Co"/><F fk="contact" label="Contact Person" placeholder="John Doe"/></FG><FG><F fk="email" label="Email" type="email"/><F fk="phone" label="Phone" type="tel"/></FG><FG cols={3}><F fk="cat" label="Category" type="select" options={tr.supplierCats}/><F fk="terms" label="Payment Terms (days)" type="number" placeholder="30"/><F fk="currency" label="Currency" type="select" options={tr.currencies}/></FG><FG><F fk="address" label="Address"/><F fk="taxNum" label="Tax / VAT Number"/></FG><F fk="bankDetails" label="Bank Details / IBAN"/><F fk="notes" label="Notes" type="textarea" rows={2}/></>}
      {modal==="po"&&<><FG><F fk="num" label="PO Number *" placeholder="PO-2026-001"/><F fk="supId" label="Supplier" type="select" options={supOpts}/></FG><FG cols={3}><F fk="date" label="Order Date" type="date"/><F fk="delivDate" label="Delivery Date" type="date"/><F fk="status" label="Status" type="select" options={tr.procStatuses}/></FG><LineItemsEditor lines={lines} onChange={setLines}/><F fk="notes" label="Notes" type="textarea" rows={2}/></>}
      {modal==="utility"&&<><F fk="month" label="Month (YYYY-MM) *" placeholder={new Date().toISOString().slice(0,7)}/><FG cols={3}><F fk="prevReading" label="Previous Reading (kWh)" type="number"/><F fk="currReading" label="Current Reading (kWh)" type="number"/><F fk="kwhRate" label="Rate / kWh" type="number" placeholder="0.38"/></FG>{+form.currReading>+form.prevReading&&<div style={{padding:"10px 14px",borderRadius:10,background:`${t.a}10`,marginBottom:14,fontSize:13}}>⚡ <b>{(+form.currReading-+form.prevReading).toFixed(0)} kWh</b> · Bill: <b style={{color:t.a}}>{fmtNum(((+form.currReading-+form.prevReading)*(+form.kwhRate||0.38)),2)}</b></div>}<FG><F fk="workerCost" label="Labor Cost" type="number"/><F fk="opsCost" label="Operations Cost" type="number"/></FG><F fk="notes" label="Notes" type="textarea" rows={2}/></>}
      {modal==="product"&&<><FG><F fk="name" label="Product Name *" placeholder="Enterprise License"/><F fk="sku" label="SKU Code" placeholder="EL-001"/></FG><FG cols={3}><F fk="cat" label="Category" type="select" options={tr.productCats}/><F fk="costPrice" label="Cost Price" type="number"/><F fk="salePrice" label="Sale Price" type="number"/></FG>{+form.costPrice>0&&+form.salePrice>0&&<div style={{padding:"8px 12px",background:`${t.a}10`,borderRadius:8,fontSize:12,marginBottom:14,color:t.tx3}}>Margin: <b style={{color:t.a}}>{Math.round(((+form.salePrice-+form.costPrice)/+form.salePrice)*100)}%</b></div>}<FG cols={3}><F fk="stock" label="Stock Qty" type="number"/><F fk="reorder" label="Reorder Level" type="number"/><F fk="unit" label="Unit" placeholder="unit, hour, kg"/></FG><FG><F fk="barcode" label="Barcode" placeholder="Optional"/><F fk="notes" label="Notes"/></FG></>}
      {modal==="company"&&<><FG><F fk="name" label="Company Name *" placeholder="Apex Trading LLC"/><F fk="type" label="Type" placeholder="Trading, Retail..."/></FG><FG cols={3}><F fk="currency" label="Currency" type="select" options={tr.currencies}/><F fk="tax" label="Tax Rate %" type="number" placeholder="5"/><F fk="color" label="Brand Color" type="color"/></FG><FG><F fk="taxNum" label="Tax / VAT Number"/><F fk="phone" label="Phone" type="tel"/></FG><FG><F fk="email" label="Email" type="email"/><F fk="website" label="Website"/></FG><F fk="address" label="Address" type="textarea" rows={2}/><div style={{marginTop:8,marginBottom:8,borderTop:`1px solid ${t.bd}`,paddingTop:16}}><div style={{fontSize:12,fontWeight:700,color:t.tx3,marginBottom:12}}>🏦 Bank Details</div></div><FG><F fk="bankName" label="Bank Name" placeholder="Emirates NBD"/><F fk="bankIBAN" label="IBAN / Account #" placeholder="AE07033..."/></FG><FG><F fk="bankSwift" label="SWIFT / BIC" placeholder="EBILAEAD"/><F fk="bankBranch" label="Branch" placeholder="Business Bay"/></FG><div style={{marginTop:8,marginBottom:8,borderTop:`1px solid ${t.bd}`,paddingTop:16}}><div style={{fontSize:12,fontWeight:700,color:t.tx3,marginBottom:12}}>🧾 Invoice Defaults</div></div><F fk="invoiceFooter" label="Invoice Footer Text" type="textarea" rows={2} placeholder="Thank you for your business! Payment within 30 days."/><F fk="invoicePayInstructions" label="Payment Instructions" type="textarea" rows={2} placeholder="Bank transfer to Emirates NBD, IBAN: AE07..."/></>}
      {modal==="crmLead"&&<><FG><F fk="company" label="Company *" placeholder="Future Tech LLC"/><F fk="name" label="Contact Name" placeholder="John Smith"/></FG><FG><F fk="email" label="Email" type="email"/><F fk="phone" label="Phone" type="tel"/></FG><FG cols={3}><F fk="stage" label="Pipeline Stage" type="select" options={tr.pipelineStages}/><F fk="dealValue" label="Deal Value" type="number" placeholder="50000"/><F fk="probability" label="Probability %" type="number" placeholder="50"/></FG><FG><F fk="assignedTo" label="Assigned To" placeholder="Sales Rep name"/><F fk="source" label="Lead Source" placeholder="LinkedIn, Referral..."/></FG><FG><F fk="nextFollowUp" label="Next Follow Up" type="date"/><F fk="currency" label="Currency" type="select" options={tr.currencies}/></FG><F fk="notes" label="Notes" type="textarea" rows={2}/></>}
      {modal==="facility"&&<><FG><F fk="name" label="Facility Name *" placeholder="Cold Hub Block A"/><F fk="type" label="Type" type="select" options={tr.storageFacTypes}/></FG><FG cols={3}><F fk="capacity" label="Total Units" type="number"/><F fk="monthlyRate" label="Monthly Rate/Unit" type="number"/><F fk="address" label="Address"/></FG><FG><F fk="minTemp" label="Min Temp (°C)" type="number"/><F fk="maxTemp" label="Max Temp (°C)" type="number"/></FG><F fk="notes" label="Notes" type="textarea" rows={2}/></>}
      {modal==="storageUnit"&&<><FG><F fk="name" label="Unit Name *" placeholder="Unit A-01"/><F fk="facId" label="Facility" type="select" options={facOpts}/></FG><FG><F fk="clientId" label="Client" type="select" options={[{value:"",label:"— Available —"},...cOpts]}/><F fk="capacity" label="Capacity (sqm)" type="number"/></FG><FG><F fk="entryDate" label="Entry Date" type="date"/><F fk="exitDate" label="Exit Date" type="date"/></FG><FG cols={3}><F fk="priceDay" label="Price / Day" type="number"/><F fk="stored" label="Used Capacity" type="number"/><F fk="temp" label="Current Temp (°C)" type="number"/></FG><F fk="notes" label="Notes" type="textarea" rows={2}/></>}
      {modal==="payslip"&&renderPayslip()}
    </Modal>
    </FormCtx.Provider>
  );
}



// ═══════════════════════════════════════════════════════════
//  MASHRO3Y v8.3 — GLOBAL SEARCH (Ctrl+K)
// ═══════════════════════════════════════════════════════════
function GlobalSearch({onClose,onNavigate}){
  const {t,tr,fmt,cC,cI,cQ,cW,cSup,cProd,cCRM,lang}=useApp();
  const [query,setQuery]=React.useState("");
  const inputRef=React.useRef(null);

  React.useEffect(()=>{
    setTimeout(()=>inputRef.current?.focus(),50);
    const h=e=>{if(e.key==="Escape")onClose();};
    document.addEventListener("keydown",h);
    return()=>document.removeEventListener("keydown",h);
  },[onClose]);

  const results=React.useMemo(()=>{
    const q=query.trim().toLowerCase();
    if(q.length<2)return[];
    const groups=[];

    // Clients
    const clients=cC.filter(c=>(c.name||"").toLowerCase().includes(q)||(c.company||"").toLowerCase().includes(q)||(c.email||"").toLowerCase().includes(q));
    if(clients.length>0)groups.push({
      label:lang==="ar"?"العملاء":"Clients",icon:"👥",page:"clients",
      items:clients.slice(0,5).map(c=>({id:c.id,primary:c.name,secondary:c.company||c.email||"",icon:"👤",action:()=>onNavigate("clients",c)})),
    });

    // Invoices
    const invs=cI.filter(i=>(i.num||"").toLowerCase().includes(q)||(i.clientName||"").toLowerCase().includes(q));
    if(invs.length>0)groups.push({
      label:lang==="ar"?"الفواتير":"Invoices",icon:"🧾",page:"invoices",
      items:invs.slice(0,5).map(i=>({id:i.id,primary:i.num,secondary:`${i.clientName} · ${fmt(calcInvTotal(i))} · ${invStatus(i)}`,icon:"🧾",action:()=>onNavigate("invoices",i)})),
    });

    // Quotes
    const quotes=cQ.filter(q2=>(q2.num||"").toLowerCase().includes(q)||(q2.clientName||"").toLowerCase().includes(q));
    if(quotes.length>0)groups.push({
      label:lang==="ar"?"عروض الأسعار":"Quotes",icon:"📋",page:"quotes",
      items:quotes.slice(0,4).map(qo=>({id:qo.id,primary:qo.num,secondary:`${qo.clientName} · ${fmt(calcInvTotal(qo))}`,icon:"📋",action:()=>onNavigate("quotes",qo)})),
    });

    // Workers
    const workers=cW.filter(w=>(w.name||"").toLowerCase().includes(q)||(w.role||"").toLowerCase().includes(q)||(w.dept||"").toLowerCase().includes(q));
    if(workers.length>0)groups.push({
      label:lang==="ar"?"الموظفون":"Workers",icon:"👷",page:"workers",
      items:workers.slice(0,4).map(w=>({id:w.id,primary:w.name,secondary:`${w.role} · ${w.dept}`,icon:"👷",action:()=>onNavigate("workers",w)})),
    });

    // Suppliers
    const sups=cSup.filter(s=>(s.name||"").toLowerCase().includes(q)||(s.contact||"").toLowerCase().includes(q)||(s.cat||"").toLowerCase().includes(q));
    if(sups.length>0)groups.push({
      label:lang==="ar"?"الموردون":"Suppliers",icon:"🏭",page:"procurement",
      items:sups.slice(0,4).map(s=>({id:s.id,primary:s.name,secondary:`${s.cat} · ${s.contact||""}`,icon:"🏭",action:()=>onNavigate("procurement",s)})),
    });

    // Products
    const prods=cProd.filter(p=>(p.name||"").toLowerCase().includes(q)||(p.sku||"").toLowerCase().includes(q));
    if(prods.length>0)groups.push({
      label:lang==="ar"?"المنتجات":"Products",icon:"📦",page:"products",
      items:prods.slice(0,4).map(p=>({id:p.id,primary:p.name,secondary:`SKU: ${p.sku} · ${fmt(p.salePrice)}`,icon:"📦",action:()=>onNavigate("products",p)})),
    });

    // CRM
    const leads=cCRM.filter(l=>(l.company||"").toLowerCase().includes(q)||(l.name||"").toLowerCase().includes(q));
    if(leads.length>0)groups.push({
      label:lang==="ar"?"صفقات CRM":"CRM Deals",icon:"🎯",page:"crm",
      items:leads.slice(0,4).map(l=>({id:l.id,primary:l.company,secondary:`${l.name} · ${l.stage} · ${fmt(l.dealValue)}`,icon:"🎯",action:()=>onNavigate("crm",l)})),
    });

    return groups;
  },[query,cC,cI,cQ,cW,cSup,cProd,cCRM]);

  const totalResults=results.reduce((s,g)=>s+g.items.length,0);

  return(
    <div style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,.7)",backdropFilter:"blur(4px)",display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:"10vh"}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:t.bg2,borderRadius:18,width:"100%",maxWidth:580,maxHeight:"70vh",overflow:"hidden",boxShadow:t.sh2,border:`1px solid ${t.bd}`,display:"flex",flexDirection:"column",animation:"modalPop .2s cubic-bezier(.34,1.56,.64,1)"}}>
        {/* Search input */}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 18px",borderBottom:`1px solid ${t.bd}`,flexShrink:0}}>
          <span style={{fontSize:18,color:t.tx4}}>🔍</span>
          <input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)}
            placeholder={lang==="ar"?"ابحث عن أي شيء... (فواتير، عملاء، موظفون)":"Search anything... (invoices, clients, workers)"}
            style={{flex:1,border:"none",background:"transparent",color:t.tx,fontSize:15,outline:"none",fontFamily:"inherit"}}/>
          <kbd style={{padding:"2px 7px",borderRadius:5,background:t.bg4,border:`1px solid ${t.bd}`,fontSize:10,color:t.tx4,fontFamily:"monospace"}}>Esc</kbd>
        </div>

        {/* Results */}
        <div style={{flex:1,overflowY:"auto"}}>
          {query.length<2&&(
            <div style={{padding:24,textAlign:"center"}}>
              <div style={{fontSize:36,marginBottom:10}}>🔍</div>
              <div style={{fontSize:14,color:t.tx3,fontWeight:600,marginBottom:6}}>{lang==="ar"?"ابدأ الكتابة للبحث":"Start typing to search"}</div>
              <div style={{fontSize:12,color:t.tx4,marginBottom:16}}>{lang==="ar"?"ابحث في الفواتير والعملاء والموظفين والمنتجات":"Search invoices, clients, workers, products, and more"}</div>
              <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
                {[{k:"Ctrl+K",a:lang==="ar"?"فتح البحث":"Open Search"},{k:"↑↓",a:lang==="ar"?"التنقل":"Navigate"},{k:"Enter",a:lang==="ar"?"اختيار":"Select"},{k:"Esc",a:lang==="ar"?"إغلاق":"Close"}].map(({k,a})=>(
                  <div key={k} style={{display:"flex",gap:4,alignItems:"center",fontSize:11,color:t.tx4}}>
                    <kbd style={{padding:"2px 6px",borderRadius:4,background:t.bg4,border:`1px solid ${t.bd}`,fontFamily:"monospace",fontSize:10}}>{k}</kbd>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query.length>=2&&totalResults===0&&(
            <EmptyState icon="🔍" title={lang==="ar"?"لا توجد نتائج":"No results"} subtitle={`${lang==="ar"?"لا توجد نتائج لـ":"Nothing found for"} "${query}"`}/>
          )}

          {results.map(group=>(
            <div key={group.label}>
              <div style={{padding:"8px 18px 4px",fontSize:10,fontWeight:800,color:t.tx4,letterSpacing:.5,textTransform:"uppercase",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>{group.icon} {group.label}</span>
                <button onClick={()=>{onNavigate(group.page);onClose();}} style={{fontSize:10,color:t.a,background:"none",border:"none",cursor:"pointer",fontWeight:700}}>{lang==="ar"?"عرض الكل":"View all →"}</button>
              </div>
              {group.items.map(item=>(
                <button key={item.id} onClick={()=>{item.action();onClose();}}
                  style={{width:"100%",padding:"10px 18px",display:"flex",gap:12,alignItems:"center",border:"none",background:"transparent",cursor:"pointer",textAlign:"left",borderBottom:`1px solid ${t.bd}`,transition:"background .1s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=t.bg3}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{width:34,height:34,borderRadius:8,background:`${t.a}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{item.icon}</div>
                  <div style={{flex:1,minWidth:0,textAlign:"start"}}>
                    <div style={{fontSize:13,fontWeight:700,color:t.tx,marginBottom:1}}>{item.primary}</div>
                    <div style={{fontSize:11,color:t.tx4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.secondary}</div>
                  </div>
                  <div style={{fontSize:12,color:t.tx4,flexShrink:0}}>↗</div>
                </button>
              ))}
            </div>
          ))}
        </div>

        {totalResults>0&&(
          <div style={{padding:"8px 18px",borderTop:`1px solid ${t.bd}`,flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:11,color:t.tx4}}>{totalResults} {lang==="ar"?"نتيجة":"results"}</span>
            <span style={{fontSize:11,color:t.tx4}}>↵ {lang==="ar"?"للاختيار":"to select"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
// ─── SIDEBAR ─────────────────────────────────────────────────
function Sidebar({mod,setMod}){
  const{t,tr,lang,companies,acId,setAcId}=useApp();
  const co=companies.find(c=>c.id===acId)||companies[0]||{};
  const rtl=lang==="ar";
  const SGL={en:{overview:"Overview",finance:"Finance",business:"Business",hr:"HR",ops:"Operations",tools:"Tools",admin:"Admin"},ar:{overview:"الرئيسية",finance:"المالية",business:"الأعمال",hr:"الموارد البشرية",ops:"العمليات",tools:"الأدوات",admin:"الإدارة"}};
  const SL=SGL[lang]||SGL.en;
  const groups=[
    {label:SL.overview,items:[{id:"dashboard",icon:"⬡",label:rtl?"لوحة التحكم":"Dashboard"}]},
    {label:SL.finance,items:[{id:"revenues",icon:"💰",label:tr.revenue},{id:"expenses",icon:"📉",label:tr.expenses},{id:"invoices",icon:"🧾",label:tr.invoices},{id:"quotes",icon:"📋",label:tr.quotes},{id:"vault",icon:"🏦",label:tr.vault},{id:"budget",icon:"🎯",label:tr.budget}]},
    {label:SL.business,items:[{id:"clients",icon:"👥",label:tr.clients},{id:"crm",icon:"🎯",label:rtl?"إدارة العملاء":"CRM"},{id:"products",icon:"📦",label:tr.products},{id:"procurement",icon:"🛒",label:tr.procurement}]},
    {label:SL.hr,items:[{id:"workers",icon:"👷",label:tr.workers}]},
    {label:SL.ops,items:[{id:"utilities",icon:"⚡",label:tr.utilities},{id:"storage",icon:"❄",label:tr.storage}]},
    {label:SL.tools,items:[{id:"reports",icon:"📊",label:tr.reports},{id:"ai",icon:"🤖",label:rtl?"المساعد الذكي":"AI Assistant"}]},
    {label:SL.admin,items:[{id:"companies",icon:"🏢",label:tr.companies},{id:"settings",icon:"⚙",label:tr.settings}]},
  ];
  return(
    <div className="sidebar" style={{width:220,background:t.bg2,borderRight:rtl?"none":`1px solid ${t.bd}`,borderLeft:rtl?`1px solid ${t.bd}`:"none",height:"100vh",position:"fixed",top:0,left:rtl?"auto":0,right:rtl?0:"auto",zIndex:100,flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"14px 14px 10px",borderBottom:`1px solid ${t.bd}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:34,height:34,borderRadius:10,background:t.ag,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:900,color:"#0A0C0F"}}>M</div>
          <div><div style={{fontSize:14,fontWeight:900,color:t.tx}}>MASHRO3Y</div><div style={{fontSize:9,color:t.tx4,letterSpacing:.5}}>ENTERPRISE v8.3</div></div>
        </div>
        <select value={acId} onChange={e=>setAcId(+e.target.value)} style={{width:"100%",padding:"7px 10px",borderRadius:8,border:`1px solid ${t.bd}`,background:t.bg3,color:t.tx,fontSize:12,fontWeight:600,outline:"none"}}>
          {companies.map(c=><option key={c.id} value={c.id}>{c.logo} {c.name}</option>)}
        </select>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"6px 8px"}}>
        {groups.map(grp=>(
          <div key={grp.label} style={{marginBottom:2}}>
            <div style={{fontSize:9,fontWeight:700,color:t.tx5,padding:"8px 8px 3px",letterSpacing:.8}}>{grp.label.toUpperCase()}</div>
            {grp.items.map(item=>(
              <button key={item.id} onClick={()=>setMod(item.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:8,border:"none",cursor:"pointer",background:mod===item.id?t.a+"20":"transparent",color:mod===item.id?t.a:t.tx3,fontSize:12.5,fontWeight:mod===item.id?700:500,marginBottom:1,textAlign:"start",transition:"all .12s"}}>
                <span style={{fontSize:14,width:18,textAlign:"center"}}>{item.icon}</span>
                <span style={{flex:1}}>{item.label}</span>
                {mod===item.id&&<span style={{width:5,height:5,borderRadius:"50%",background:t.a,flexShrink:0}}/>}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div style={{padding:"10px 12px",borderTop:`1px solid ${t.bd}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:co.color||t.a,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff"}}>{co.logo}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:11,fontWeight:700,color:t.tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{co.name}</div>
            <div style={{fontSize:10,color:t.tx4}}>{co.currency} · {co.tax}{lang==="ar"?"% ضريبة":"% tax"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BottomNav({mod,setMod}){
  const{t,tr,setShowNotifs,setShowShortcuts}=useApp();
  const allNotes=useNotifications();
  const unread=allNotes.length;
  const items=[
    {id:"dashboard",icon:"⬡",label:"Home"},
    {id:"invoices",icon:"🧾",label:"Invoices"},
    {id:"revenues",icon:"💰",label:"Revenue"},
    {id:"workers",icon:"👷",label:"Workers"},
    {id:"clients",icon:"👥",label:"Clients"},
    {id:"__notif",icon:"🔔",label:"Alerts",badge:unread},
  ];
  const handleTap=(item)=>{
    if(typeof navigator.vibrate==="function")navigator.vibrate(8);
    if(item.id==="__notif"){setShowNotifs(true);return;}
    setMod(item.id);
  };
  return(
    <div className="bottom-nav" style={{position:"fixed",bottom:0,left:0,right:0,background:t.bg2,borderTop:`1px solid ${t.bd}`,zIndex:100,paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
      {items.map(item=>{
        const active=item.id!=="__notif"&&mod===item.id;
        return(
          <button key={item.id} onClick={()=>handleTap(item)}
            style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"6px 2px 8px",border:"none",background:"transparent",color:active?t.a:t.tx4,cursor:"pointer",transition:"color .15s",position:"relative"}}>
            <div style={{position:"relative",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:10,background:active?`${t.a}18`:"transparent",transition:"background .15s"}}>
              <span style={{fontSize:18,lineHeight:1}}>{item.icon}</span>
              {item.badge>0&&<div style={{position:"absolute",top:0,right:0,width:14,height:14,borderRadius:"50%",background:"#EF4444",color:"#fff",fontSize:8,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",border:`1.5px solid ${t.bg2}`}}>{Math.min(item.badge,9)}</div>}
            </div>
            <span style={{fontSize:9,fontWeight:active?800:600,letterSpacing:.2}}>{item.label}</span>
            {active&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:24,height:3,borderRadius:"0 0 3px 3px",background:t.a}}/>}
          </button>
        );
      })}
    </div>
  );
}

function Header({mod,setMod}){
  const{t,tr,lang,companies,acId,showNotifs,setShowNotifs,setShowShortcuts,setShowSearch}=useApp();
  const co=companies.find(c=>c.id===acId)||companies[0]||{};
  const allNotes=useNotifications();
  const [readSet,setReadSet]=React.useState(new Set());
  const unread=allNotes.length-readSet.size;
  const pages={dashboard:tr.dashboard,revenues:tr.revenue,expenses:tr.expenses,invoices:tr.invoices,quotes:tr.quotes,clients:tr.clients,crm:tr.crm||"CRM",products:tr.products,procurement:tr.procurement,workers:tr.workers,utilities:tr.utilities,storage:tr.storage,reports:tr.reports,ai:tr.ai||"AI",companies:tr.companies,settings:tr.settings,vault:tr.vault,budget:tr.budget};
  return(
    <div style={{height:52,background:t.bg2,borderBottom:`1px solid ${t.bd}`,display:"flex",alignItems:"center",padding:"0 20px",gap:10,position:"sticky",top:0,zIndex:50,flexShrink:0}}>
      <div style={{fontSize:14,fontWeight:700,color:t.tx,flex:1}}>{pages[mod]||mod}</div>
      <div style={{fontSize:11,color:t.tx4,fontWeight:600,display:"none"}}>{co.name} · {co.currency}</div>
      <Tooltip text={lang==="ar"?"بحث (Ctrl+K)":"Search (Ctrl+K)"}>
        <button onClick={()=>setShowSearch(true)} style={{width:120,height:30,borderRadius:8,border:`1px solid ${t.bd}`,background:t.bg3,color:t.tx4,cursor:"pointer",display:"flex",alignItems:"center",gap:6,padding:"0 10px",fontSize:11,transition:"all .15s"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=t.a;e.currentTarget.style.color=t.tx;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=t.bd;e.currentTarget.style.color=t.tx4;}}>
          <span>🔍</span>
          <span style={{flex:1}}>{lang==="ar"?"بحث...":"Search..."}</span>
          <kbd style={{padding:"1px 5px",borderRadius:3,background:t.bg4,border:`1px solid ${t.bd}`,fontSize:9,fontFamily:"monospace"}}>⌘K</kbd>
        </button>
      </Tooltip>
      <Tooltip text="Keyboard shortcuts (?)">
        <button onClick={()=>setShowShortcuts(true)} style={{width:30,height:30,borderRadius:8,border:`1px solid ${t.bd}`,background:t.bg3,color:t.tx3,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>⌨</button>
      </Tooltip>
      <Tooltip text="Notifications">
        <button onClick={()=>setShowNotifs(!showNotifs)} style={{width:30,height:30,borderRadius:8,border:`1px solid ${unread>0?t.a:t.bd}`,background:unread>0?`${t.a}15`:t.bg3,color:unread>0?t.a:t.tx3,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,position:"relative",transition:"all .2s"}}>
          🔔
          {unread>0&&<div style={{position:"absolute",top:-4,right:-4,width:16,height:16,borderRadius:"50%",background:"#EF4444",color:"#fff",fontSize:9,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",animation:"notifPulse 2s infinite",border:`2px solid ${t.bg2}`}}>{Math.min(unread,9)}{unread>9?"":""}</div>}
        </button>
      </Tooltip>
      <button onClick={()=>setMod("settings")} style={{width:30,height:30,borderRadius:8,border:`1px solid ${t.bd}`,background:t.bg3,color:t.tx3,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>⚙</button>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────
function App(){
  const[lang,setLang]=useState(()=>ls("m3y_v7_lang","en"));
  const[dark,setDark]=useState(()=>ls("m3y_v7_dark",true));
  const[accentName,setAccentName]=useState(()=>ls("m3y_v7_accent","Blue"));
  const[compact,setCompact]=useState(()=>ls("m3y_v7_compact",false));
  const[acId,setAcId]=useState(()=>ls("m3y_v7_acId",1));
  const[onboarded,setOnboarded]=useState(()=>ls("m3y_v8_onboarded",false));
  const[showNotifs,setShowNotifs]=useState(false);
  const[showShortcuts,setShowShortcuts]=useState(false);
  const[showSearch,setShowSearch]=useState(false);
  const[mod,setMod]=useState("dashboard");
  const[companies,setCompanies]=useState(()=>ls("m3y_v7_companies",SEED.companies));
  const[revs,setRevs]=useState(()=>ls("m3y_v7_revs",SEED.revs));
  const[exps,setExps]=useState(()=>ls("m3y_v7_exps",SEED.exps));
  const[invs,setInvs]=useState(()=>ls("m3y_v7_invs",SEED.invoices));
  const[quotes,setQuotes]=useState(()=>ls("m3y_v7_quotes",SEED.quotes));
  const[clients,setClis]=useState(()=>ls("m3y_v7_clients",SEED.clients));
  const[budgets,setBuds]=useState(()=>ls("m3y_v7_budgets",SEED.budgets));
  const[vAccs,setVAccs]=useState(()=>ls("m3y_v7_vaccs",SEED.vaultAccounts));
  const[vTxs,setVTxs]=useState(()=>ls("m3y_v7_vtxs",SEED.vaultTxs));
  const[workers,setWorkers]=useState(()=>ls("m3y_v7_workers",SEED.workers));
  const[absences,setAbsences]=useState(()=>ls("m3y_v7_absences",SEED.absences));
  const[salaries,setSalaries]=useState(()=>ls("m3y_v7_salaries",SEED.salaries));
  const[leaveReq,setLeaveReq]=useState(()=>ls("m3y_v7_leaveReq",SEED.leaveRequests));
  const[overtime,setOT]=useState(()=>ls("m3y_v7_overtime",SEED.overtime));
  const[loans,setLoans]=useState(()=>ls("m3y_v7_loans",SEED.loans));
  const[advances,setAdv]=useState(()=>ls("m3y_v7_advances",SEED.advances));
  const[suppliers,setSups]=useState(()=>ls("m3y_v7_suppliers",SEED.suppliers));
  const[pos,setPos]=useState(()=>ls("m3y_v7_pos",SEED.purchaseOrders));
  const[utils,setUtils]=useState(()=>ls("m3y_v7_utils",SEED.utilities));
  const[products,setProds]=useState(()=>ls("m3y_v7_products",SEED.products));
  const[facilities,setFacs]=useState(()=>ls("m3y_v7_facs",SEED.storageFacilities));
  const[storageUnits,setUnits]=useState(()=>ls("m3y_v7_units",SEED.storageUnits));
  const[crm,setCRM]=useState(()=>ls("m3y_v7_crm",SEED.crmLeads));
  const[toasts,setToasts]=useState([]);
  const[modal,setModal]=useState(null);
  const[modalData,setModalData]=useState(null);

  // Auto-saves
  useEffect(()=>{lsSet("m3y_v7_companies",companies);},[companies]);
  useEffect(()=>{lsSet("m3y_v7_revs",revs);},[revs]);
  useEffect(()=>{lsSet("m3y_v7_exps",exps);},[exps]);
  useEffect(()=>{lsSet("m3y_v7_invs",invs);},[invs]);
  useEffect(()=>{lsSet("m3y_v7_quotes",quotes);},[quotes]);
  useEffect(()=>{lsSet("m3y_v7_clients",clients);},[clients]);
  useEffect(()=>{lsSet("m3y_v7_budgets",budgets);},[budgets]);
  useEffect(()=>{lsSet("m3y_v7_vaccs",vAccs);},[vAccs]);
  useEffect(()=>{lsSet("m3y_v7_vtxs",vTxs);},[vTxs]);
  useEffect(()=>{lsSet("m3y_v7_workers",workers);},[workers]);
  useEffect(()=>{lsSet("m3y_v7_absences",absences);},[absences]);
  useEffect(()=>{lsSet("m3y_v7_salaries",salaries);},[salaries]);
  useEffect(()=>{lsSet("m3y_v7_leaveReq",leaveReq);},[leaveReq]);
  useEffect(()=>{lsSet("m3y_v7_overtime",overtime);},[overtime]);
  useEffect(()=>{lsSet("m3y_v7_loans",loans);},[loans]);
  useEffect(()=>{lsSet("m3y_v7_advances",advances);},[advances]);
  useEffect(()=>{lsSet("m3y_v7_suppliers",suppliers);},[suppliers]);
  useEffect(()=>{lsSet("m3y_v7_pos",pos);},[pos]);
  useEffect(()=>{lsSet("m3y_v7_utils",utils);},[utils]);
  useEffect(()=>{lsSet("m3y_v7_products",products);},[products]);
  useEffect(()=>{lsSet("m3y_v7_facs",facilities);},[facilities]);
  useEffect(()=>{lsSet("m3y_v7_units",storageUnits);},[storageUnits]);
  useEffect(()=>{lsSet("m3y_v7_crm",crm);},[crm]);
  useEffect(()=>{lsSet("m3y_v7_lang",lang);},[lang]);
  useEffect(()=>{lsSet("m3y_v7_dark",dark);},[dark]);
  useEffect(()=>{lsSet("m3y_v7_accent",accentName);},[accentName]);
  useEffect(()=>{lsSet("m3y_v7_acId",acId);},[acId]);

  const theme=useMemo(()=>mkTheme(dark,accentName),[dark,accentName]);
  const tr=T[lang]||T.en;
  const rtl=lang==="ar";
  const co=useMemo(()=>companies.find(c=>c.id===acId)||companies[0]||{currency:"AED"},[companies,acId]);
  const fmt=useCallback(n=>fmtCur(n,co.currency||"AED",lang),[co,lang]);

  // Filtered by active company
  const cR=useMemo(()=>revs.filter(r=>r.cId===acId),[revs,acId]);
  const cE=useMemo(()=>exps.filter(e=>e.cId===acId),[exps,acId]);
  const cI=useMemo(()=>invs.filter(i=>i.cId===acId),[invs,acId]);
  const cQ=useMemo(()=>quotes.filter(q=>q.cId===acId),[quotes,acId]);
  const cC=useMemo(()=>clients.filter(c=>c.cId===acId),[clients,acId]);
  const cB=useMemo(()=>budgets.filter(b=>b.cId===acId),[budgets,acId]);
  const cVA=useMemo(()=>vAccs.filter(a=>a.cId===acId),[vAccs,acId]);
  const cVT=useMemo(()=>vTxs.filter(t=>t.cId===acId),[vTxs,acId]);
  const cW=useMemo(()=>workers.filter(w=>w.cId===acId),[workers,acId]);
  const cAbs=useMemo(()=>absences.filter(a=>a.cId===acId),[absences,acId]);
  const cSal=useMemo(()=>salaries.filter(s=>s.cId===acId),[salaries,acId]);
  const cLR=useMemo(()=>leaveReq.filter(l=>l.cId===acId),[leaveReq,acId]);
  const cOT=useMemo(()=>overtime.filter(o=>o.cId===acId),[overtime,acId]);
  const cLoans=useMemo(()=>loans.filter(l=>l.cId===acId),[loans,acId]);
  const cAdv=useMemo(()=>advances.filter(a=>a.cId===acId),[advances,acId]);
  const cSup=useMemo(()=>suppliers.filter(s=>s.cId===acId),[suppliers,acId]);
  const cPO=useMemo(()=>pos.filter(p=>p.cId===acId),[pos,acId]);
  const cUtils=useMemo(()=>utils.filter(u=>u.cId===acId),[utils,acId]);
  const cProd=useMemo(()=>products.filter(p=>p.cId===acId),[products,acId]);
  const cFac=useMemo(()=>facilities.filter(f=>f.cId===acId),[facilities,acId]);
  const cSU=useMemo(()=>storageUnits.filter(u=>u.cId===acId),[storageUnits,acId]);
  const cCRM=useMemo(()=>crm.filter(l=>l.cId===acId),[crm,acId]);

  const showToast=useCallback((msg,type="success")=>{
    const id=uid();
    setToasts(p=>[...p,{id,msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3500);
  },[]);
  const openModal=useCallback((type,data=null)=>{setModal(type);setModalData(data);},[]);
  const closeModal=useCallback(()=>{setModal(null);setModalData(null);},[]);

  // Global keyboard shortcuts
  React.useEffect(()=>{
    const h=e=>{
      const tag=document.activeElement?.tagName?.toLowerCase();
      if(tag==="input"||tag==="textarea"||tag==="select")return;
      if(e.key==="?"&&!e.ctrlKey&&!e.metaKey){setShowShortcuts(true);return;}
      if((e.ctrlKey||e.metaKey)&&e.key==="k"){e.preventDefault();setShowSearch(s=>!s);return;}
      if(e.ctrlKey&&e.key==="n"){e.preventDefault();openModal("invoice",{});return;}
      if(e.ctrlKey&&e.key==="r"){e.preventDefault();openModal("revenue",{});return;}
      if(e.ctrlKey&&e.key==="e"){e.preventDefault();openModal("expense",{});return;}
      if(!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.shiftKey){
        const map={d:"dashboard",r:"revenues",e:"expenses",i:"invoices",w:"workers",c:"clients"};
        if(map[e.key])setMod(map[e.key]);
      }
    };
    document.addEventListener("keydown",h);
    return()=>document.removeEventListener("keydown",h);
  },[openModal,setMod]);

  const ctx={
    t:theme,tr,lang,setLang,rtl,dark,setDark,accentName,setAccentName,compact,setCompact,
    acId,setAcId,companies,setCompanies,co,fmt,
    cR,cE,cI,cQ,cC,cB,cVA,cVT,cW,cAbs,cSal,cLR,cOT,cLoans,cAdv,cSup,cPO,cUtils,cProd,cFac,cSU,cCRM,
    setRevs,setExps,setInvs,setQuotes,setClis,setBuds,
    setVAccs,setVTxs,setWorkers,setAbsences,setSalaries,setLeaveReq,setOT,setLoans,setAdv,
    setSups,setPos,setUtils,setProds,setFacs,setUnits,setCRM,
    showToast,openModal,closeModal,modal,modalData,setMod,showNotifs,setShowNotifs,showShortcuts,setShowShortcuts,showSearch,setShowSearch,
  };

  const renderPage=()=>{switch(mod){
    case"dashboard":return<Dashboard/>;
    case"revenues":return<RevenuePage/>;
    case"expenses":return<ExpensePage/>;
    case"invoices":return<InvoicePage/>;
    case"quotes":return<QuotesPage/>;
    case"vault":return<VaultPage/>;
    case"budget":return<BudgetPage/>;
    case"clients":return<ClientsPage/>;
    case"crm":return<CRMPage/>;
    case"products":return<ProductsPage/>;
    case"procurement":return<ProcurementPage/>;
    case"workers":return<WorkersPage/>;
    case"utilities":return<UtilitiesPage/>;
    case"storage":return<StoragePage/>;
    case"reports":return<ReportsPage/>;
    case"ai":return<AIPage/>;
    case"companies":return<CompaniesPage/>;
    case"settings":return<SettingsPage/>;
    default:return<Dashboard/>;
  }};

  if(!onboarded)return(
    <Ctx.Provider value={ctx}>
      <div dir={rtl?"rtl":"ltr"} style={{fontFamily:rtl?"'Tajawal','Arial',sans-serif":"'Inter','Segoe UI',system-ui,sans-serif",background:theme.bg,color:theme.tx,minHeight:"100vh"}}>
        <OnboardingWizard onComplete={()=>setOnboarded(true)}/>
      </div>
    </Ctx.Provider>
  );

  return(
    <Ctx.Provider value={ctx}>
      <div dir={rtl?"rtl":"ltr"} style={{fontFamily:rtl?"'Tajawal','Arial',sans-serif":"'Inter','Segoe UI',system-ui,sans-serif",background:theme.bg,color:theme.tx,minHeight:"100vh"}}>
        <Toast toasts={toasts}/>
        <Sidebar mod={mod} setMod={setMod}/>
        <div className="main-content" style={{display:"flex",flexDirection:"column",minHeight:"100vh"}}>
          <Header mod={mod} setMod={setMod}/>
          <div style={{flex:1,overflowY:"auto"}}><div key={mod} className="animate-in">{renderPage()}</div></div>
        </div>
        <BottomNav mod={mod} setMod={setMod}/>
        <AllModals/>
        {showNotifs&&<NotificationsPanel onClose={()=>setShowNotifs(false)} onNavigate={page=>{setMod(page);}}/>}
        {showShortcuts&&<KeyboardShortcutsPanel onClose={()=>setShowShortcuts(false)}/>}
        {showSearch&&<GlobalSearch onClose={()=>setShowSearch(false)} onNavigate={(page,data)=>{setMod(page);setShowSearch(false);}}/>}
      </div>
    </Ctx.Provider>
  );
}

const root=ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
