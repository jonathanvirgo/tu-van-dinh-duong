function displayMessage(message) {
    var confirmBox = `
    <div class="modal fade" id="modal_message_successful" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content">
        <button class="modal-btn-close btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
        <div class="text-center mb-2">
          <svg class="iconsvg-confirm text-success fs-65px">
            <use xlink:href="/public/content/images/sprite.svg#confirm"></use>
          </svg>
        </div>
        <h4 class="modal-title text-center mb-0">` + message +`</h4>
      </div>
    </div>
  </div>`;
  $("#modal_confirm_box").html(confirmBox); 
  $("#modal_message_successful").modal('show');
} 

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

function validateBookingForm( role_id = 0){
    if ($("#booking_form #site_id").val() == 0) {
        displayError('Bạn chưa chọn website');
        return false;
    }
    if ($("#booking_form #channel_id").val() == 0 || $("#booking_form #channel_id").val() == '') {
        displayError('Bạn chưa chọn chuyên mục');
        return false;
    }
    if ($("#booking_form #fm_id").val() == 0 || $("#booking_form #fm_id").val() == '') {
        displayError('Bạn chưa chọn loại bài');
        return false;
    }
    if ($("#booking_form #book_date").val() == "") {
        displayError('Bạn chưa chọn ngày booking');
        return false;
    }
    if ($("#booking_form #time_from").val() == 0 || $("#booking_form #time_from").val() == "") {
        displayError('Bạn chưa chọn giờ lên site');
        return false;
    }
    return true;
}

function confirmBoxBookingCreate(){
    var domain      = $("#booking_form #site_id option:selected").text();
    var channel     = $('#booking_form #channel_id option:selected').text() + ' / '+ (domain == "" ? $("#site_name").text() : domain);
    var time_from   = $('#booking_form #time_from option:selected').text();
    var fm_name     = $('#booking_form #fm_id option:selected').text();
    var book_date   = $('#booking_form #book_date').val();
    var fm_price    = $('#booking_form #fm_price').val();
    var confirmBox  = `
    <div class="modal fade" id="modal_create_booking" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content fs-16px">
                <button class="modal-btn-close btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
                <h3 class="modal-title text-center mb-4">Xác nhận thông tin booking</h3>
                <p><span class="fw-bold">Chuyên mục: </span>`+channel+`</span></p>
                <p><span class="fw-bold">Giờ lên: </span>`+book_date + ' ' + time_from +`</p>
                <p><span class="fw-bold">Loại bài: </span>`+fm_name+`</p>
                <p><span class="fw-bold">Giá: </span>`+fm_price+`</p>
                <p><span>Booking của bạn cần phải gửi bài trước giờ lên site 4 giờ làm việc. Nếu không, booking sẽ bị hủy.</span></p>
                <div class="row gx-2 mt-2">
                    <div class="col-6">
                        <button class="btn btn-cancel box-btn w-100 text-uppercase" type="button" data-bs-dismiss="modal">
                            <svg class="iconsvg-close flex-shrink-0 fs-16px me-2">
                                <use xlink:href="/public/content/images/sprite.svg#close"></use>
                            </svg>
                            Không
                        </button>
                    </div>
                    <div class="col-6">
                        <a onclick="bookingCreate()" class="btn btn-primary box-btn w-100 text-uppercase">
                        <svg class="iconsvg-confirm flex-shrink-0 fs-16px me-2">
                            <use xlink:href="/public/content/images/sprite.svg#confirm"></use>
                        </svg>
                            Đồng ý
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    $("#modal_confirm_box").html(confirmBox);        
    $("#modal_create_booking").modal('show');
}

function confirmBoxBookingCancel(booking_id_pr) {
    var confirmBox  =`
      <div class="modal fade" id="modal_cancel_booking" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <button class="modal-btn-close btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
            <div class="text-center mb-2">
              <svg class="iconsvg-trash-lg text-tra-lai fs-65px">
                <use xlink:href="/public/content/images/sprite.svg#trash-lg"></use>
              </svg>
            </div>
            <h4 class="modal-title text-center text-tra-lai mb-4">Huỷ booking</h4>
            <p class="text-body-2 fw-5 text-center mb-4">Bạn có muốn hủy booking này không?</p>
            <div class="row g-2 justify-content-center">
              <div class="col-6">
                <button class="btn btn-cancel box-btn w-100 text-uppercase" type="button" data-bs-dismiss="modal">Không</button>
              </div>
              <div class="col-6">
                <button onclick="bookingCancel(`+booking_id_pr+`)" class="btn btn-primary box-btn w-100 text-uppercase" type="button" data-bs-dismiss="modal">
                  <svg class="iconsvg-confirm flex-shrink-0 fs-16px me-2">
                    <use xlink:href="/public/content/images/sprite.svg#confirm"></use>
                  </svg>Đồng ý
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    $("#modal_confirm_box").html(confirmBox);        
    $("#modal_cancel_booking").modal('show');
}

function confirmBoxBookingUpdate(domain){
    var channel     = $('#booking_form #channel_id option:selected').text() + ' / '+ domain;
    var time_from   = $('#booking_form #time_from option:selected').text();
    var fm_name     = $('#booking_form #fm_id option:selected').text();
    var fm_price    = $('#booking_form #fm_price').val();
    var book_date   = $('#booking_form #book_date').val();
    var confirmBox  = `
        <div class="modal fade" id="modal_update_booking" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content fs-16px">
                    <button class="modal-btn-close btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
                    <h3 class="modal-title text-center mb-4">Xác nhận thông tin booking</h3>
                    <p><span class="fw-bold">Chuyên mục: </span>`+channel+`</span></p>
                    <p><span class="fw-bold">Giờ lên: </span>`+ book_date + ' ' + time_from+`</p>
                    <p><span class="fw-bold">Loại bài: </span>`+fm_name+`</p>
                    <p><span class="fw-bold">Giá: </span>`+fm_price+`</p>
                    <p><span>Booking của bạn cần phải gửi bài trước giờ lên site 4 giờ làm việc. Nếu không, booking sẽ bị hủy.</span></p>
                    <div class="row gx-2 mt-2">
                        <div class="col-6">
                            <button class="btn btn-cancel box-btn w-100 text-uppercase" type="button" data-bs-dismiss="modal">
                            <svg class="iconsvg-close flex-shrink-0 fs-16px me-2">
                                <use xlink:href="/public/content/images/sprite.svg#close"></use>
                            </svg>
                            Không
                            </button>
                        </div>
                        <div class="col-6">
                            <a onclick="bookingUpdate()" class="btn btn-primary box-btn w-100 text-uppercase">
                            <svg class="iconsvg-confirm flex-shrink-0 fs-16px me-2">
                                <use xlink:href="/public/content/images/sprite.svg#confirm"></use>
                            </svg>
                            Đồng ý
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    $("#modal_confirm_box").html(confirmBox);        
    $("#modal_update_booking").modal('show');
}

function bookingCreate() {
    var returnUrl   = "";
    var loading     = $("#loading-page");
    var form_data   = $("#booking-detail").serialize();

    $.ajax({
        url: '/booking/create',
        type: 'POST',
        dataType: 'JSON',
        data: form_data,
        cache: false,
        beforeSend: function () {
            loading.show();
        },
        success: function (result) {
            loading.hide();
            if(!result.success) {
               displayError(result.message);
               return;
            }
            if(result.returnUrl !== ""){
                returnUrl = result.returnUrl;
            } else {
                returnUrl = "/booking?site_id=" + result.site_id;
            }
            $.post( "/mail/send", { book_id: result.book_id, type: 'mail_Tao_Book', loop:(result.returnUrl ? 'article' : 'book')}).done(function( data ) {});
            window.location.href = returnUrl;
        },
        error: function(jqXHR, exception){
            loading.hide();
            ajax_call_error(jqXHR, exception);
        }
    });
}

function bookingUpdate(domain) {
    var loading     = $("#loading-page");
    var form_data   = $("#booking-detail").serialize();
    
    $.ajax({
        url: '/booking/update',
        type: 'POST',
        dataType: 'JSON',
        data: form_data,
        cache: false,
        beforeSend: function () {
            loading.show();
        },
        success: function (result) {
            loading.hide();
            if(!result.success) {
               displayError(result.message.replace(/,/g, '</br>'));
               return;
            }
            displayMessage(result.message.replace(/,/g, '</br>'));
            window.setTimeout(function() {
                window.location.href = "/booking";
            }, 3000);
        },
        error: function(jqXHR, exception){
            loading.hide();
            ajax_call_error(jqXHR, exception);
        }
    });
}

function bookingCancel(booking_id_pr) {
    var loading = $("#loading-page");

    $.ajax({
        url: '/booking/cancel',
        type: 'POST',
        dataType: 'JSON',
        data: {
            booking_id_pr: booking_id_pr
        },
        cache: false,
        beforeSend: function() {
            loading.show();
        },
        success: function(result) {
            loading.hide();
            if (!result.success) {
                displayError(result.message);
                return;
            }
            displayMessage(result.message);
            $.get(result.send_mail_url, function(response, status){});
            window.setTimeout(function() {
                window.location.href = "/booking";
            }, 3000);
        },
        error: function(jqXHR, exception) {
            loading.hide();
            ajax_call_error(jqXHR, exception);
        }
    });
}

function getArticleTimeFrom(prefix, isCheckLimit = true, selectValue = '') {
    var loading    = $("#loading-page"),
        channel_id = parseInt($('#article_form #'+ prefix +'_channel_id').val()),
        book_date  = $('#article_form #'+ prefix +'_book_date').val(),
        time_from  = $('#article_form #'+ prefix +'_time_from').val();
    
    if(channel_id > 0 && book_date != ''){
        $.ajax({
            url: '/booking/getTimeFrom',
            type: 'GET',
            dataType: 'json',
            data: {
                'channel_id': channel_id,
                'book_date': book_date
            },
            beforeSend: function () {
                loading.show();
            },
            success: function (result) {
                loading.hide();
                if (result.status) {
                    $('#article_form #'+ prefix +'_time_from').html('');
                    let rootOption = new Option('', '', false, false);
                    $('#article_form #'+ prefix +'_time_from').append(rootOption);
                    for(let item of result.time){
                        let newOption = new Option(item, item, false, false);
                        if(item == time_from){
                            newOption = new Option(item, item, false, true);
                        }
                        $('#article_form #'+ prefix +'_time_from').append(newOption);
                    }
                    $("#article_form #"+ prefix +"_time_from").prop('disabled', false);
                    if(selectValue != ''){
                       $("#article_form #"+ prefix +"_time_from").val(selectValue).trigger('change'); 
                    }
                    if(isCheckLimit){
                        chkArticleLimit(prefix);
                    }
                } else {
                    $('#article_form #'+ prefix +'_time_from').html('<option></option>');   
                    $("#article_form #"+ prefix +"_time_from").prop('disabled', false);
                }
            },
            error: function(jqXHR, exception){
                loading.hide();
                ajax_call_error(jqXHR, exception);
            }
        });
    }
}

function chkArticleLimit(prefix, prefix_name) {
    var booking_id      = $("#article_book_id").val(),
        booking_id_pr   = $("#article_booking_id_pr").val(),
        fm_id           = $('#article_form #'+ prefix +'_format_id').val(),
        channel_id      = $('#article_form #'+ prefix +'_channel_id').val(),
        book_date       = $('#article_form #'+ prefix +'_book_date').val(),
        time_from       = $('#article_form #'+ prefix +'_time_from').val();
    
    if(booking_id_pr > 0){
        quotaBookingLimit(booking_id, channel_id, fm_id, book_date, time_from, 1, prefix, prefix_name.id);
    }
}

function getTimeFrom(booking_id = 0, isCheckLimit = true) {
    var loading    = $("#loading-page"),
        channel_id = parseInt($('#booking_form #channel_id').val()),
        book_date  = $('#booking_form #book_date').val(),
        time_from  = $('#booking_form #time_from').val();
    
    if(channel_id > 0 && book_date != ''){
        $.ajax({
            url: '/booking/getTimeFrom',
            type: 'GET',
            dataType: 'json',
            data: {
                'channel_id': channel_id,
                'book_date': book_date
            },
            beforeSend: function () {
                loading.show();
            },
            success: function (result) {
                loading.hide();
                if (result.status) {
                    $('#booking_form #time_from').html('');
                    let rootOption = new Option('', '', false, false);
                    $('#booking_form #time_from').append(rootOption);
                    for(let item of result.time){
                        let newOption = new Option(item, item, false, false);
                        if(item == time_from){
                            newOption = new Option(item, item, false, true);
                        }
                        $('#booking_form #time_from').append(newOption);
                    }
                    $("#booking_form #time_from").prop('disabled', false);
                    checkDisabledBookingForm();
                    if(isCheckLimit){
                        chkBookingLimit(booking_id);
                    }
                } else {
                    $('#booking_form #time_from').html('<option></option>');   
                    $("#booking_form #time_from").prop('disabled', false);
                    displayError(result['message']);
                }
            },
            error: function(jqXHR, exception){
                loading.hide();
                ajax_call_error(jqXHR, exception);
            }
        });
    }
}

function chkBookingLimit(booking_id = 0) {
    var fm_id       = $('#booking_form #fm_id').val(),
        channel_id  = $('#booking_form #channel_id').val(),
        book_date   = $('#booking_form #book_date').val(),
        time_from   = $('#booking_form #time_from').val();
    
    quotaBookingLimit(booking_id, channel_id, fm_id, book_date, time_from, 0, '');
}

//type = 0 Check từ form booking, type = 1 Check từ form tạo bài viết
function quotaBookingLimit(booking_id = 0, channel_id = 0, fm_id = 0, book_date = '', time_from = '', type = 0, prefix = '', prefix_name = '') {
    var loading = $("#loading-page");
    if(channel_id > 0 && fm_id > 0 && time_from != '0' && time_from != null && time_from != ''){
        $.ajax({
            url: '/booking/checkLimitBooking',
            type: 'GET',
            dataType: 'JSON',
            data: {
                channel_id: channel_id,
                format_id: fm_id,
                book_date: book_date,
                time_from: time_from,
                booking_id: booking_id
            },
            beforeSend: function () {
                loading.show();
            },
            success: function (result) {
                loading.hide();
                if(type == 1){
                    //Bài viết
                    $("#msgArticleQuota").html("");
                    if(!result.status) {
                        dataArticle.overQuota = true;
                        $("#msgArticleQuota").html("Booking của bạn đang bị quá quota, khi bạn sửa thông tin này sẽ tạo yêu cầu sửa.");
                    } else {
                        dataArticle.overQuota = false;
                    }
                    if(prefix_name !== ''){
                        var prefix_key = prefix_name.replace('art_','').replace('sendreview_','');
                        checkRequestEdit(prefix, prefix_key);
                    }
                } else {
                    //Booking
                    if(!result.status) {
                        displayError(result.message);
                    }
                }
            },
            error: function(jqXHR, exception){
                loading.hide();
                ajax_call_error(jqXHR, exception);
            }
        });
    }
}

function createSelectData(target, data, name, id){
    if(data.length > 0){
        $(target).empty();
        let rootOption = new Option('', '', false, false);
        $(target).append(rootOption);
        for(let item of data){
            let newOption = new Option(item[name], item[id], false, false);
            if((target.indexOf("format_id") !== -1 || target.indexOf("fm_id") !== -1) && item.price){
                newOption.dataset['price'] = item.price;
            }
            $(target).append(newOption);
            if(item.children && item.children.length > 0){
                for(let child of item.children){
                    let chlOption = new Option(item[name] + ' >> ' + child[name], child[id], false, false);
                    $(target).append(chlOption);
                }
            }
        }
    }
}

function getAllChanelFormatBySiteId(target_site, target_channel, target_format){
    var loading     = $("#loading-page");
    var site_id     = $(target_site).val();
   
    if(site_id > 0){
        $.ajax({
            type: 'GET',
            url: '/booking/getAllChanelFormatBySiteId',
            data: { site_id: site_id},
            beforeSend: function () {
                // loading.show();
            },
            success: function (response) {
                // loading.hide();
                if (response.success) {
                    $('#booking_form #fm_price').val('');
                    createSelectData(target_channel, response.channels, 'name', 'id');
                    createSelectData(target_format, response.formats, 'label', 'value');
                    if(target_site == '#editor_site_id'){
                        // sửa layout load lại dữ liệu form sendreview lên format và channel select2 
                        if($('#sendreview_channel_id').val() !== 0) $('#editor_channel_id').val($('#sendreview_channel_id').val()).trigger('change');
                        if($('#sendreview_format_id').val() !== 0) $('#editor_format_id').val($('#sendreview_format_id').val()).trigger('change');
                    }
                } else {
                    displayError(response.message);
                }
                // change site check button unlock
                if(target_site !== '#editor_site_id' && target_site !== '#booking_form #site_id') checkUnlockButton(target_site.substring(1, target_site.indexOf('_')));
            },
            error: function(jqXHR, exception){
                // loading.hide();
                ajax_call_error(jqXHR, exception);
            }
        });
    } else {
        displayError("Lỗi, Thiếu tham số lấy site_id!");
    }
}

function loadDataWhenSiteChange(prefix){
    var site     = '#' + prefix + '_site_id',
        channel  = '#' + prefix + '_channel_id',
        format   = '#' + prefix + '_format_id';
    getAllChanelFormatBySiteId(site, channel, format);
}

function checkDisabledBookingForm() {
    var valid = true;
    if ($("#booking_form #channel_id").val() == 0) {
        valid = false;
    }
    if ($("#booking_form #fm_id").val() == 0) {
        valid = false;
    }
    if ($("#booking_form #book_date").val() == '') {
        valid = false;
    }
    if ($("#booking_form #time_from").val() == 0) {
        valid = false;
    }
    if(!valid){
        $("#booking-detail #btn_create_booking").prop('disabled', true);
        $("#booking-detail #btn_edit_booking").prop('disabled', true);
    } else {
        $("#booking-detail #btn_create_booking").prop('disabled', false);
        $("#booking-detail #btn_edit_booking").prop('disabled', false);
    }
}

function getListBookingForPublish(prefix, channel_allow, price_allow) {
    var site_id        = $('#' + prefix + '_site_id').val(),
        channel_id     = $('#' + prefix + '_channel_id').val(),
        fm_id          = $('#' + prefix + '_format_id').val(),
        loading        = $("#loading-page");
    
    if(site_id > 0){
        $.ajax({
            url: '/booking/getListBookingForPublish',
            type: 'GET',
            dataType: 'JSON',
            data: {
                site_id: site_id,
                channel_id: channel_id,
                fm_id: fm_id,
                price_allow: parseInt(price_allow.replace(/,/g,"")),
                channel_allow: channel_allow
            },
            beforeSend: function () {
                loading.show();
            },
            success: function (result) {
                loading.hide();
                if(!result.status) {
                   displayError(result.message);
                }
                var rootOption = new Option('', '', false, false);
                $("#" + prefix + "_book_id").empty();
                $("#" + prefix + "_book_id").append(rootOption);
                for(var item of result.bookings){
                    var newOption = new Option(item.name, item.id, false, false);
                    $("#" + prefix + "_book_id").append(newOption);
                }
            },
            error: function(jqXHR, exception){
                loading.hide();
                ajax_call_error(jqXHR, exception);
            }
        });
    }
}

const numberFormat = new Intl.NumberFormat();

function selectBookingArticle(prefix, book){
    var format_id       = $('option:selected', book).attr('data-format_id');
    var channel_id      = $('option:selected', book).attr('data-channel_id');
    var book_date       = $('option:selected', book).attr('data-book_date');
    var time_from       = $('option:selected', book).attr('data-time_from');
    var booking_id_pr   = $('option:selected', book).attr('data-booking_id_pr');

    $("#"+ prefix +"_format_id").val(format_id).trigger('change');
    $("#"+ prefix +"_channel_id").val(channel_id);

    $("#"+ prefix +"_book_date").val(book_date);
    $("#"+ prefix +"_book_date").flatpickr({
        dateFormat: "d-m-Y",
        maxDate: new Date().fp_incr(29)
    });
    $("#"+ prefix +"_channel_id").select2({
        templateResult: fomatTemplateSelect2,
        escapeMarkup: function (m) { return m; }
    });

    if(book.value > 0){
        $("#form_book_date").show();
        $("#book_time_from_now").html(time_from + " " + book_date);
        if(booking_id_pr > 0){
            window.setTimeout(function () {
                $("#select2-"+ prefix +"_book_id-container").text(booking_id_pr);
            },50);
        }
    } else {
        $("#form_book_date").hide();
    }
    getArticleTimeFrom(prefix, true, time_from);
    checkUnlockButton(prefix);
}

function statistic_search() {
    var site_ids   = $("#website_select").val(),
        status_ids = $("#status_select").val(),
        book_date  = $("#sfilter_date").val();

    if (Array.isArray(site_ids)) {
        if (site_ids.length > 0) {
            site_ids = site_ids.join(',');
            $('#dashboard_filter').append('<input type="hidden" name="site_ids" value="'+site_ids+'" />');
        }
    }
    if (Array.isArray(status_ids)) {
        if (status_ids.length > 0) {
            status_ids = status_ids.join(',');
            $('#dashboard_filter').append('<input type="hidden" name="status_ids" value="'+status_ids+'" />');
        }
    }
    if (book_date !== '') {
      $('#dashboard_filter').append('<input type="hidden" name="book_date" value="'+book_date+'" />');
    }
    
    $("#dashboard_filter").submit();
  }

function fomatTemplateSelect2(state){
    if (!state.id){
        switch(state.text){
            case '-- Chuyên mục không trong phạm vi được duyệt và cần được tạo yêu cầu sửa':
                return `<span style="color:#c3523a">` + state.text + `</span> <a class='contact-support-dropdown-select2' onclick="showContactSupportDropdownSelect2('chuyen_muc')">
                    <svg class="iconsvg-close flex-shrink-0 fs-16px me-2">
                        <use xlink:href="/public/content/images/sprite.svg#contact-support"></use>
                    </svg>
                </a>`;
            case '-- Loại bài không trong phạm vi được duyệt và cần được tạo yêu cầu sửa':
                return `<span style="color:#c3523a">` + state.text + `</span> <a class='contact-support-dropdown-select2' onclick="showContactSupportDropdownSelect2('loai_bai')">
                    <svg class="iconsvg-close flex-shrink-0 fs-16px me-2">
                        <use xlink:href="/public/content/images/sprite.svg#contact-support"></use>
                    </svg>
                </a>`;
            case '-- Loại bài trong phạm vi được đề xuất':
            case '-- Chuyên mục trong phạm vi được đề xuất':
                return `<span style="color:#096d34">` + state.text + `</span>`;
            default: break;
        }
    }  
    return state.text;
}