function displayError(message) {
    var confirmBox = `
    <div class="modal fade" id="modal_message_error" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content">
        <button class="modal-btn-close btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
        <div class="text-center mb-2">
          <svg class="iconsvg-alert-circle-lg text-danger fs-65px">
            <use xlink:href="/public/content/images/sprite.svg#alert-circle-lg"></use>
          </svg>
        </div>
        <h4 class="modal-title text-center mb-2">Lỗi</h4>
        <p class="mb-0 fw-5 text-body-2 text-center">` + message + `</p>
      </div>
    </div>
  </div>`;
  $("#modal_confirm_box").html(confirmBox); 
  $("#modal_message_error").modal('show');
}

function ajax_call_error(jqXHR, exception){
    var msg = '';
    if (jqXHR.status === 0) {
        msg = 'Mất kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.';
    } else if (jqXHR.status == 404) {
        msg = 'Không tìm thấy trang được yêu cầu. [404]';
    } else if (jqXHR.status == 500) {
        msg = 'Lỗi máy chủ nội bộ [500].';
    } else if (exception === 'parsererror') {
        msg = 'Phân tích cú pháp JSON không thành công.';
    } else if (exception === 'timeout') {
        msg = 'Lỗi hết thời gian.';
    } else if (exception === 'abort') {
        msg = 'Yêu cầu Ajax đã bị hủy bỏ.';
    } else {
        msg = jqXHR.responseText;
    }
    displayError(msg);
}

function numberKeyOnly(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57)) return false;
    return true;
}

function phone_change() {
    var phone   = $("#signup-form #phone").val();
    console.log("phone_change");
    $("#imgchkphone").html("");
    $("#signup-form #phone").removeClass('error-border');

    if (phone == '') {
        document.getElementById("phone").focus();
        $("#signup-form #phone").addClass('error-border');
        return;
    } else {
        if(phone.indexOf(' ') !== -1){
            $("#imgchkphone").html("Số điện thoại không được chứa dấu cách");
            document.getElementById("phone").focus();
            $("#signup-form #phone").addClass('error-border');
            return;
        }
    }
}

function email_change() {
    var loading = $("#signup-form #imgajaxemail");
    var email   = $("#signup-form #email").val();
    
    $("#imgchkemail").html("");
    $("#signup-form #email").removeClass('error-border');
    $("#signup-form #email").val($.trim(email));
    
    if (email == '' || $.trim(email) == '') {
        document.getElementById("email").focus();
        $("#signup-form #email").addClass('error-border');
        $("#imgchkemail").html("Email không được để trống!");
        return;
    } else {
    
    }
}

function password_change() {
    var password         = $("#signup-form #password").val();
    var confirm_password = $("#signup-form #confirm_password").val();

    $("#imgchkpassword").html("");
    $("#signup-form #password").removeClass('error-border');
    $("#signup-form #password").val($.trim(password));

    if(confirm_password == ''){
        $("#imgchkcf_password").html("");
        $("#signup-form #confirm_password").removeClass('error-border');
    }
    if (password == '' || $.trim(password) == '') {
        document.getElementById("password").focus();
        $("#signup-form #password").addClass('error-border');
        $("#imgchkpassword").html("Mật khẩu không được để trống!");
        return;
    } else {
        if(password.length < 9){
            $("#imgchkpassword").html("Mật khẩu sử dụng tối thiểu 9 ký tự");
            document.getElementById("password").focus();
            $("#signup-form #password").addClass('error-border');
            return;
        }
    }
}

function birthday_change() {
    var birthday = $.trim($("#signup-form #birthday").val());
    $("#imgchkbirthday").html("");
    $("#signup-form #birthday").removeClass('error-border');
    if(!validDateBirthday(birthday)){
        $("#imgchkbirthday").html("Ngày sinh không hợp lệ!");
        $("#signup-form #birthday").addClass('error-border');
    }
}

function validDateBirthday(dateString){
    if(!/^\d{1,2}\-\d{1,2}\-\d{4}$/.test(dateString)){
        return false;
    }
    
    var parts       = dateString.split("-"),
        month       = parseInt(parts[1], 10),
        day         = parseInt(parts[0], 10),
        year        = parseInt(parts[2], 10),
        d           = new Date(),
        yearnow     = d.getFullYear(),
        monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
    
    if(year < 1000 || year >= yearnow || month == 0 || month > 12){
        return false;
    }

    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)){
        monthLength[1] = 29;
    }
    return day > 0 && day <= monthLength[month - 1];
}

function signup() {
    var check_signup     = true,
        check_email      = true,
        check_phone      = true,
        check_password   = true,
        check_confirm_pw = true,
        form         = $("#signup-form"),
        loading      = $("#loading-page"),
        email        = $("#signup-form #email").val(),
        phone        = $("#signup-form #phone").val(),
        password     = $("#signup-form #password").val(),
        confirm_pw   = $("#signup-form #confirm_password").val();
    
    console.log("signup", email, phone, password, confirm_pw);
    if ($("#imgchkphone").text() !== ''){
        check_signup = false;
        check_phone  = false;
    } else {
        $("#signup-form #phone").removeClass('error-border');
        if (phone == "") {
            $("#imgchkphone").html("Số điện thoại không được để trống!");
            $("#signup-form #phone").addClass('error-border');
            check_signup = false;
            check_phone  = false;
        }
    }
    
    if ($("#imgchkemail").text() !== ''){
        check_signup = false;
        check_email  = false;
    } else {
        $("#signup-form #email").removeClass('error-border');
        if (email == "" || $.trim(email) == "") {
            $("#imgchkemail").html("Email không được để trống!");
            $("#signup-form #email").addClass('error-border');
            check_signup = false;
            check_email  = false;
        }
    }
    
    if ($("#imgchkpassword").text() !== ''){
        check_signup   = false;
        check_password = false;
    } else {
        $("#signup-form #password").removeClass('error-border');
        if (password == "" || $.trim(password) == "") {
            $("#imgchkpassword").html("Mật khẩu không được để trống!");
            $("#signup-form #password").addClass('error-border');
            check_signup   = false;
            check_password = false;
        }
    }

    if ($("#imgchkcf_password").text() !== ''){
        check_signup     = false;
        check_confirm_pw = false;
    } else {
        $("#signup-form #confirm_password").removeClass('error-border');
        if (confirm_pw == "" || $.trim(confirm_pw) == "") {
            $("#imgchkcf_password").html("Xác nhận mật khẩu không được để trống!");
            $("#signup-form #confirm_password").addClass('error-border');
            check_signup     = false;
            check_confirm_pw = false;
        }
    }

    if(!check_phone){
        document.getElementById("phone").focus();
        return;
    }
    if(!check_email){
        document.getElementById("email").focus();
        return;
    }

    if(!check_password){
        document.getElementById("password").focus();
        return;
    }
    if(!check_confirm_pw){
        document.getElementById("confirm_password").focus();
        return;
    }
    if(check_signup == true){
        $.ajax({
            url: "/user/signup",
            type: 'POST',
            beforeSend: function() {
                loading.show();
            },
            data: form.serialize(),
            success: function(result) {
                loading.hide();
                if (result.status == true) {
                    strMessage = `
                    <div class="login-body">
                        <div class="text-center mb-2">
                            <svg class="iconsvg-confirm text-success fs-65px">
                              <use xlink:href="/public/content/images/sprite.svg#confirm"></use>
                            </svg>
                        </div>
                        <h4 class="text-center mb-3">Đăng ký thành công</h4>
                        <p class="mb-4">Bạn đã tạo tài khoản thành công, thư điện tử xác nhận đã được gửi đến địa chỉ email của bạn. Bạn hãy kiểm tra lại hòm thư và làm theo hướng dẫn để kích hoạt tài khoản.</p>
                        <div class="text-center">
                            <a class="btn login-btn btn-primary text-uppercase min-w-200px" href="/user/login" role="button">Đăng nhập</a>
                        </div>
                    </div>`;
                    $("#footer").css("display","none");
                    $("#login-content-page").html(strMessage);
                } else {
                    console.log(result);
                    if(result.error){
                        if(result.error.full_name.length > 0){
                            $("#imgchkfull_name").html(result.error.full_name.toString());
                            $("#signup-form #full_name").addClass('error-border');
                        }
                        if(result.error.phone.length > 0){
                            $("#imgchkphone").html(result.error.phone.toString());
                            $("#signup-form #phone").addClass('error-border');
                        }
                        if(result.error.birthday.length > 0){
                            $("#imgchkbirthday").html(result.error.birthday.toString());
                            $("#signup-form #birthday").addClass('error-border');
                        }
                        if(result.error.gender.length > 0){
                            $("#imgchkgender").html(result.error.gender.toString());
                            $("#signup-form #gender").addClass('error-border');
                        }
                        if(result.error.email.length > 0){
                            $("#imgchkemail").html(result.error.email.toString());
                            $("#signup-form #email").addClass('error-border');
                        }
                        if(result.error.password.length > 0){
                            $("#imgchkpassword").html(result.error.password.toString());
                            $("#signup-form #password").addClass('error-border');
                        }
                        if(result.error.confirm_password.length > 0){
                            $("#imgchkcf_password").html(result.error.confirm_password.toString());
                            $("#signup-form #confirm_password").addClass('error-border');
                        }
                    }
                    if(result.message !== ""){
                        displayError(result.message.replace(/,/g, '</br>'));
                    }
                }
            },
            error: function(jqXHR, exception) {
                loading.hide();
                ajax_call_error(jqXHR, exception);
            }
        });
    }
}

$('#signup-form #phone').keypress(function (event) {
    return numberKeyOnly(event);
});


$(document).ready(function () {
	$('#login-form').submit(function (e) {
        e.preventDefault();
        var form 	 = $("#login-form"),
            loading  = $("#loading-page"),
			username = $("#login-form #login_username").val(),
			password = $("#login-form #login_password").val();

        $("#ercf_username").html("");
        $("#ercf_password").html("");

	  	if (username == "") {
	    	$("#ercf_username").html("Tên truy cập không được để trống!");
	    	return false;
	  	}
	  	if (password == "") {
		    $("#ercf_password").html("Mật khẩu không được để trống!");
		    return false;
		}

        $.ajax({
            url: "/user/login",
            type: 'POST',
            beforeSend: function () {
                loading.show();
                $("#ercf_username").html("");
                $("#ercf_password").html("");
            },
            data: form.serialize(),
            success: function (result) {
            	loading.hide();
            	if (result.status == true) {
                    window.location.href = '/';
            	} else {
                    if(result.message !== ""){
                        if(result.message == "INVALID_USERNAME"){
                            $("#ercf_username").html("Tên đăng nhập không chính xác!");
                        } else if(result.message == "INVALID_USERNAME_OR_PASSWORD"){
                            $("#ercf_password").html("Tên đăng nhập hoặc mật khẩu không chính xác!");
                        } else if(result.message == "INACTIVE_USER"){
                            $("#ercf_username").html("Tài khoản chưa được kích hoạt!");
                        } else {
                            $("#ercf_password").html(result.message);
                        }
                    }
            	}
            },
            error: function(jqXHR, exception){
                loading.hide();
                ajax_call_error(jqXHR, exception);
            }
        });
    });
    
    $("#birthday").flatpickr({
        dateFormat: "d-m-Y",
        maxDate: "today"
    });
})

function login_showPassword() {
    var x = document.getElementById("login_password");
    $("#show-password-1").removeClass();
    if (x.type === "password") {
        x.type = "text";
        $("#show-password-1").addClass('iconsvg-eye-off');
        $("#show-password-1 use").attr('xlink:href', '/public/content/images/sprite.svg#eye-off');
    } else {
        x.type = "password";
        $("#show-password-1").addClass('iconsvg-eye');
        $("#show-password-1 use").attr('xlink:href', '/public/content/images/sprite.svg#eye');
    }
}

function signup_showPassword() {
    var x = document.getElementById("password");
    $("#show-password-2").removeClass();
    if (x.type === "password") {
        x.type = "text";
        $("#show-password-2").addClass('iconsvg-eye-off');
        $("#show-password-2 use").attr('xlink:href', '/public/content/images/sprite.svg#eye-off');
    } else {
        x.type = "password";
        $("#show-password-2").addClass('iconsvg-eye');
        $("#show-password-2 use").attr('xlink:href', '/public/content/images/sprite.svg#eye');
    }
}

function signup_showConfirmPassword() {
    var x = document.getElementById("confirm_password");
    $("#show-password-3").removeClass();
    if (x.type === "password") {
        x.type = "text";
        $("#show-password-3").addClass('iconsvg-eye-off');
        $("#show-password-3 use").attr('xlink:href', '/public/content/images/sprite.svg#eye-off');
    } else {
        x.type = "password";
        $("#show-password-3").addClass('iconsvg-eye');
        $("#show-password-3 use").attr('xlink:href', '/public/content/images/sprite.svg#eye');
    }
}

$('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
    $("#signup-form .form-control").removeClass('error-border');
    $("#signup-form .form-control").val('');
    $("#signup-form .ver-middle").html('');

    $("#signup-form #email").change(function() {
        email_change();
    });
    $("#signup-form #password").change(function() {
        password_change();
    });
    $("#signup-form #birthday").change(function() {
        birthday_change();
    });

    $("#signup-form #confirm_password").change(function() {
        var password         = $("#signup-form #password").val();
        var confirm_password = $("#signup-form #confirm_password").val();
        $("#signup-form #confirm_password").val($.trim(confirm_password));

        if(password == ''){
            $("#imgchkpassword").html("");
            $("#signup-form #password").removeClass('error-border');
        }
        if ($.trim(confirm_password) !== "") {
            $("#imgchkcf_password").html("");
            $("#signup-form #confirm_password").removeClass('error-border');
        }
        if(confirm_password.length < 9){
            $("#imgchkcf_password").html("Mật khẩu sử dụng tối thiểu 9 ký tự");
            $("#signup-form #confirm_password").addClass('error-border');
            document.getElementById("confirm_password").focus();
            return;
        }
        if(confirm_password !== password && password !== ""){
            $("#imgchkcf_password").html("Mật khẩu và xác nhận mật khẩu không chính xác!");
            $("#signup-form #confirm_password").addClass('error-border');
            document.getElementById("confirm_password").focus();
            return;
        }
    });

    $("#signup-form #address").change(function() {
        var address = $("#signup-form #address").val();
        $("#signup-form #address").val($.trim(address));
    });
});