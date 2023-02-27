let dataExamine = {
    tab: 1,
    examine: {},
    page: 'create',
    id_examine: '',
    nutritionAdviceList: [],
    activeModeOfLivingList: []
};

const numberFormat = new Intl.NumberFormat();

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

function clearInput(id){
    $(id).val('');
}

function returnList() {
    window.location.href = '/examine';
}

function saveExamine(){
    try {
        let loading         = $("#loading-page");
        changeTabExamine(dataExamine.tab);
        console.log("saveExamine", dataExamine.examine);
        let url = '/examine/create';
        if(dataExamine.page == 'edit')  url = '/examine/edit/' + dataExamine.id_examine;
        console.log("saveExamine", url);
        $.ajax({
            type: 'POST',
            url: url,
            data: dataExamine.examine,
            beforeSend: function() {
                loading.show();
            },
            success: function(result) {
                loading.hide();
                if (result.success) {
                    displayMessage('Lưu thành công');
                    setTimeout(()=>{
                        returnList();
                    }, 500);
                } else {
                    displayError(result.message);
                }
            },
            error: function(jqXHR, exception) {
                loading.hide();
                ajax_call_error(jqXHR, exception);
            }
        });
    } catch (error) {
        console.log("saveExamine 2", error);
    }
}

function changeTabExamine(tab){
    switch(dataExamine.tab){
        case 1:
            dataExamine.examine['cus_name'] = $('#cus_name').val();
            dataExamine.examine['cus_phone'] = $('#cus_phone').val();
            dataExamine.examine['cus_email'] = $('#cus_email').val();
            dataExamine.examine['cus_gender'] = $('#cus_gender').val();
            dataExamine.examine['cus_birthday'] = $('#cus_birthday').val();
            dataExamine.examine['cus_address'] = $('#cus_address').val();
            dataExamine.examine['diagnostic'] = $('#diagnostic').val();
            dataExamine.examine['cus_length'] = $('#cus_length').val();
            dataExamine.examine['cus_cntc'] = $('#cus_cntc').val();
            dataExamine.examine['cus_cnht'] = $('#cus_cnht').val();
            dataExamine.examine['cus_bmi'] = $('#cus_bmi').val();
            dataExamine.examine['clinical_examination'] = $('#clinical_examination').val();
            dataExamine.examine['erythrocytes'] = $('#erythrocytes').val();
            dataExamine.examine['cus_bc'] = $('#cus_bc').val();
            dataExamine.examine['cus_tc'] = $('#cus_tc').val();
            dataExamine.examine['cus_albumin'] = $('#cus_albumin').val();
            dataExamine.examine['cus_nakcl'] = $('#cus_nakcl').val();
            dataExamine.examine['cus_astaltggt'] = $('#cus_astaltggt').val();
            dataExamine.examine['cus_urecreatinin'] = $('#cus_urecreatinin').val();
            dataExamine.examine['cus_bilirubin'] = $('#cus_bilirubin').val();
            dataExamine.examine['exa_note'] = $('#exa_note').val();
            break;
        case 2:
            dataExamine.examine['cus_fat'] = $('#cus_fat').val();
            dataExamine.examine['cus_water'] = $('#cus_water').val();
            dataExamine.examine['cus_visceral_fat'] = $('#cus_visceral_fat').val();
            dataExamine.examine['cus_bone_weight'] = $('#cus_bone_weight').val();
            dataExamine.examine['cus_chcb'] = $('#cus_chcb').val();
            dataExamine.examine['cus_waist'] = $('#cus_waist').val();
            dataExamine.examine['cus_butt'] = $('#cus_butt').val();
            dataExamine.examine['cus_cseomong'] = $('#cus_cseomong').val();
            dataExamine.examine['active_mode_of_living'] = $('#active_mode_of_living').val();
            dataExamine.examine['glucid_should_use'] = $('#glucid_should_use').val();
            dataExamine.examine['glucid_limited_use'] = $('#glucid_limited_use').val();
            dataExamine.examine['glucid_should_not_use'] = $('#glucid_should_not_use').val();
            dataExamine.examine['protein_should_use'] = $('#protein_should_use').val();
            dataExamine.examine['protein_limited_use'] = $('#protein_limited_use').val();
            dataExamine.examine['protein_should_not_use'] = $('#protein_should_not_use').val();
            dataExamine.examine['lipid_should_use'] = $('#lipid_should_use').val();
            dataExamine.examine['lipid_limited_use'] = $('#lipid_limited_use').val();
            dataExamine.examine['lipid_should_not_use'] = $('#lipid_should_not_use').val();
            dataExamine.examine['vitamin_ck_should_use'] = $('#vitamin_ck_should_use').val();
            dataExamine.examine['vitamin_ck_limited_use'] = $('#vitamin_ck_limited_use').val();
            dataExamine.examine['vitamin_ck_should_not_use'] = $('#vitamin_ck_should_not_use').val();
            break;
        case 3:
            break;
        case 4:
            break;
        case 5:
            break;
        default: break;
    }
    dataExamine.tab = tab;
}

function diff_years(dt2, dt1) 
 {
    let diff =(dt2.getTime() - dt1.getTime()) / 1000;
    diff /= (60 * 60 * 24);
    return Math.floor(Math.abs(diff/365.25));
 }

 function caculateYearOld(selectedDates, dateStr, instance){
    let cus_birthday = new Date(dateStr.split("-").reverse().join("-"));
    let now = new Date();
    let yearOld = diff_years(now, cus_birthday);
    if(yearOld > 0){
        $('#cus_age').val(yearOld);
    }
 }

$(document).ready(function(){
    $("#cus_birthday").flatpickr({
        dateFormat: "d-m-Y",
        maxDate: "today",
        onChange: function(selectedDates, dateStr, instance) {
            caculateYearOld(selectedDates, dateStr, instance);
        },
        onReady: function(selectedDates, dateStr, instance) {
            caculateYearOld(selectedDates, dateStr, instance);
        }
    });
    $("#nutrition_advice_id").on('select2:select', function(evt) {
        if(dataExamine.nutritionAdviceList.length > 0){
            for(let item of dataExamine.nutritionAdviceList){
                if(evt.params.data.id == item.id){
                    $("#glucid_should_use").text(item.glucid_should_use);
                    $("#glucid_limited_use").text(item.glucid_limited_use);
                    $("#glucid_should_not_use").text(item.glucid_should_not_use);

                    $("#protein_should_use").text(item.protein_should_use);
                    $("#protein_limited_use").text(item.protein_limited_use);
                    $("#protein_should_not_use").text(item.protein_should_not_use);

                    $("#lipid_should_use").text(item.lipid_should_use);
                    $("#lipid_limited_use").text(item.lipid_limited_use);
                    $("#lipid_should_not_use").text(item.lipid_should_not_use);

                    $("#vitamin_ck_should_use").text(item.vitamin_ck_should_use);
                    $("#vitamin_ck_limited_use").text(item.vitamin_ck_limited_use);
                    $("#vitamin_ck_should_not_use").text(item.vitamin_ck_should_not_use);
                    break;
                }
            }
        }
    });
    $("#active_mode_of_living_id").on('select2:select', function(evt) {
        if(dataExamine.activeModeOfLivingList.length > 0){
            for(let item of dataExamine.activeModeOfLivingList){
                if(evt.params.data.id == item.id){      
                    $("#active_mode_of_living").text(item.detail);
                    break;
                }
            }
        }
    });
});
