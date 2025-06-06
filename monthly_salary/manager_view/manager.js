<script>
document.getElementById('paidDate').value = new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().split('T')[0];

google.script.run.withSuccessHandler(dateStr => {
  document.getElementById('paidDate').value = dateStr;
}).getTodayThaiDate();

function showLoginSuccessAnimation() {
  const container = document.getElementById('mainContainer');
  const checkmark = document.getElementById('loginSuccessCheckmark');
  const pageTransition = document.getElementById('pageTransition');
  const loginBtn = document.getElementById('loginBtn');
  
  loginBtn.classList.add('success');
  
  checkmark.classList.add('show');
  
  setTimeout(() => {
    container.classList.add('login-success');
  }, 800);
  
  setTimeout(() => {
    pageTransition.classList.add('show');
  }, 1200);
  
  setTimeout(() => {
    document.getElementById('loginDiv').classList.add('hidden');
    document.getElementById('formDiv').classList.remove('hidden');
    
    checkmark.classList.remove('show');
    pageTransition.classList.remove('show');
    container.classList.remove('login-success');
    loginBtn.classList.remove('success');
    
    loadBranches();
  }, 2000);
}

function showSaveSuccessAnimation() {
  const overlay = document.getElementById('saveSuccessOverlay');
  const submitBtn = document.getElementById('submitBtn');
  
  submitBtn.classList.add('success');
  
  overlay.classList.add('show');
  
  setTimeout(() => {
    overlay.classList.remove('show');
    submitBtn.classList.remove('success');
  }, 2000);
}

function handleEnter(e) {
  if (e.key === 'Enter') submitLogin();
}

function submitLogin() {
  const pass = document.getElementById('password').value;
  const errorDiv = document.getElementById('loginError');
  
  if (!pass.trim()) {
    errorDiv.textContent = 'กรุณากรอกรหัสผ่าน';
    errorDiv.style.display = 'block';
    return;
  }
  
  errorDiv.style.display = 'none';
  
  google.script.run.withSuccessHandler(isValid => {
    if (isValid) {
      showLoginSuccessAnimation();
    } else {
      errorDiv.textContent = 'รหัสผ่านไม่ถูกต้อง';
      errorDiv.style.display = 'block';
    }
  }).validatePassword(pass);
}

function loadBranches() {
  google.script.run.withSuccessHandler(branches => {
    const sel = document.getElementById('branchCode');
    const empSel = document.getElementById('employeeCode'); 

    sel.innerHTML = '<option value="">เลือกสาขา</option>';
    branches.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.code;
      opt.textContent = `${b.code} - ${b.name}`;
      sel.appendChild(opt);
    });
    empSel.innerHTML = '<option value="">กรุณาเลือกสาขาก่อน</option>';
    sel.addEventListener('change', loadEmployees);
  }).getBranchList();
}

function loadEmployees() {
  const branch = document.getElementById('branchCode').value;
  const sel = document.getElementById('employeeCode');

  if (!branch) {
    sel.innerHTML = '<option value="">กรุณาเลือกสาขาก่อน</option>';
    return;
  }

  google.script.run.withSuccessHandler(codes => {
    sel.innerHTML = '<option value="">เลือกพนักงาน</option>';
    codes.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      sel.appendChild(opt);
    });
  }).getEmployeesByBranch(branch);
}

function loadEmployeeName() {
  const empCode = document.getElementById('employeeCode').value;
  if (!empCode) return;
  google.script.run.withSuccessHandler(name => {
    document.getElementById('employeeName').value = name || '';
  }).getEmployeeName(empCode);
}

function showLoading() {
  const submitBtn = document.getElementById('submitBtn');
  const loadingScreen = document.getElementById('loadingScreen');
  
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;
  
  loadingScreen.classList.add('show');
}

function hideLoading() {
  const submitBtn = document.getElementById('submitBtn');
  const loadingScreen = document.getElementById('loadingScreen');
  
  submitBtn.classList.remove('loading');
  submitBtn.disabled = false;
  
  loadingScreen.classList.remove('show');
}

function clearForm() {
  document.getElementById('paidDate').value = new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().split('T')[0];
  document.getElementById('period').value = '';
  document.getElementById('branchCode').value = '';
  document.getElementById('employeeCode').innerHTML = '<option value="">เลือกพนักงาน</option>';
  document.getElementById('employeeName').value = '';
  document.getElementById('basicSalary').value = '';
  document.getElementById('ot').value = '';
  document.getElementById('bonus').value = '';
  document.getElementById('s_deductions').value = '';
  document.getElementById('o_deductions').value = '';

  const msgDiv = document.getElementById('formMsg');
  msgDiv.textContent = '';
  msgDiv.style.display = 'none';
  
  google.script.run.withSuccessHandler(dateStr => {
    document.getElementById('paidDate').value = dateStr;
  }).getTodayThaiDate();
}

function cancelForm() {
  clearForm();
}

function getRoundedValue(id) {
  const raw = document.getElementById(id).value;
  if (!raw || isNaN(raw)) return 0;
  return Math.round(parseFloat(raw));
}

function submitForm() {
  const data = {
    paidDate: document.getElementById('paidDate').value,
    period: document.getElementById('period').value,
    branchCode: document.getElementById('branchCode').value,
    employeeCode: document.getElementById('employeeCode').value,
    employeeName: document.getElementById('employeeName').value,
    basicSalary: getRoundedValue('basicSalary'),
    ot: getRoundedValue('ot'),
    bonus: getRoundedValue('bonus'),
    s_deductions: getRoundedValue('s_deductions'),
    o_deductions: getRoundedValue('o_deductions')
  };
  
  const msgDiv = document.getElementById('formMsg');
  
  if (!data.paidDate || !data.period || !data.branchCode || !data.employeeCode || !data.employeeName) {
    msgDiv.className = 'error';
    msgDiv.textContent = 'กรุณากรอกข้อมูลให้ครบถ้วน';
    msgDiv.style.display = 'block';
    return;
  }
  
  showLoading();
  
  google.script.run
    .withSuccessHandler(msg => {
      hideLoading();
      
      showSaveSuccessAnimation();
      
      msgDiv.className = 'success';
      msgDiv.textContent = msg;
      msgDiv.style.display = 'block';
      
      setTimeout(() => {
        clearForm();
        msgDiv.style.display = 'none';
      }, 2500);
    })
    .withFailureHandler(err => {
      hideLoading();
      
      msgDiv.className = 'error';
      msgDiv.textContent = err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
      msgDiv.style.display = 'block';
    })
    .processForm(data);
}

document.addEventListener('DOMContentLoaded', function() {
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.style.fontSize = '16px';
    });
    input.addEventListener('blur', function() {
      this.style.fontSize = '';
    });
  });
  
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.addEventListener('touchstart', function() {
      this.style.transform = 'scale(0.98)';
    });
    button.addEventListener('touchend', function() {
      this.style.transform = '';
    });
  });
});
</script>