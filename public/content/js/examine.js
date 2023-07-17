let dataExamine = {
    tab: 1,
    examine: {},
    page: 'create',
    id_examine: '',
    nutritionAdviceList: [],
    activeModeOfLivingList: [],
    medicineList: [],
    prescription: [],
    medicalTest: [],
    id_prescription: 1,
    // listMenu: [{id:1, name:"Thực đơn 1","detail":[],note: ''},{id:2, name:"Thực đơn 2","detail":[],note: ''},{id:3, name:"Thực đơn 3","detail":[], note: ''}],
    foodNameListSearch: [],
    phoneListSearch: [],
    listMenuTime: [],
    menuExamine: [],
    menuExample: [],
    isGetListMedicalTest : 0,
    isDetail: false
};

const numberFormat = new Intl.NumberFormat();

toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "20000",
    "extendedTimeOut": "20000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

function displayMessageToastr(message) {
    if(message != ''){
        toastr.success(message, 'Thông báo');
    }
} 

function displayErrorToastr(message) {
    toastr.clear();
    if(message != ''){
        toastr.error(message, 'Thông báo');
    }
}

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

function saveExamine(action){
    try {
        let loading         = $("#loading-page");
        changeTabExamine(dataExamine.tab);
        if(!dataExamine.examine.cus_name || !dataExamine.examine.cus_phone || !dataExamine.examine.cus_birthday || !dataExamine.examine.cus_gender){
            if(!dataExamine.examine.cus_name){
                displayErrorToastr('Vui lòng nhập họ tên!');
                return;
            } 
            if(!dataExamine.examine.cus_phone){
                displayErrorToastr('Vui lòng nhập số điện thoại!');
                return;
            } 
            if(!dataExamine.examine.cus_birthday){
                displayErrorToastr('Vui lòng nhập ngày sinh!');
                return;
            } 
            if(!dataExamine.examine.cus_gender){
                displayErrorToastr('Vui lòng nhập giới tính!');
                return;
            } 
        }
        let birthday = moment(dataExamine.examine.cus_birthday,"DD-MM-YYYY");
        if(!birthday.isValid()){
            displayErrorToastr('Ngày sinh sai định dạng ngày-tháng-năm!');
            return;
        }
        let status = parseInt($('#status_examine').val());
        // action 1 tiếp nhận 2 đang khám 3 hoàn thành 0 ko thay doi;
        if(action) dataExamine.examine['action'] = action;
        if(action == 0) dataExamine.examine['action'] = status;
        if(status == 2 && action == 1) dataExamine.examine['action'] = 2;
        if(status == 3) dataExamine.examine['action'] = 3;
        let url = '/examine/create';
        if(dataExamine.page == 'edit')  url = '/examine/edit/' + dataExamine.id_examine;
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

    }
}

function exportExamine(){
    try {
        let tab = dataExamine.tab;
        changeTabExamine(1);
        changeTabExamine(2);
        changeTabExamine(4);
        changeTabExamine(tab);
        var link = document.createElement('a');
        link.href = '/export/examine?data=' + encodeURIComponent(JSON.stringify(dataExamine.examine));
        link.click();
        link.remove();
    } catch (error) {

    }
}

function exportMenuExample(){
    try {
        let menu_id = $('#menu_id').val();
        if(menu_id && !isNaN(parseInt(menu_id))){
            let data = {};
            if(dataExamine.menuExamine && dataExamine.menuExamine.length > 0){
                for(let item of dataExamine.menuExamine){
                    if(item.id == parseInt(menu_id)){
                        data = item;
                        break;
                    }
                }
                if(data){
                    var link = document.createElement('a');
                    link.href = '/export/menu-example?data=' + encodeURIComponent(JSON.stringify(data));
                    link.click();
                    link.remove();
                }else{
                    displayMessage('Không tìm thấy thực đơn!');
                }
            }else{
                displayMessage('Chưa có dữ liệu thực đơn!');
            }
        }else{
            displayMessage('Vui lòng chọn thực đơn!');
        }
        
    } catch (error) {
        
    }
}

function exportPrescription(){
    try {
        let tab = dataExamine.tab;
        changeTabExamine(1);
        changeTabExamine(4);
        changeTabExamine(tab);
        var link = document.createElement('a');
        link.href = '/export/prescription?data=' + encodeURIComponent(JSON.stringify(dataExamine.examine));
        link.click();
        link.remove();
    } catch (error) {

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
            dataExamine.examine['cus_anamnesis'] = $('#cus_anamnesis').val();
            dataExamine.examine['cus_living_habits'] = $('#cus_living_habits').val();
            dataExamine.examine['diagnostic'] = $('#diagnostic').val();
            dataExamine.examine['cus_length'] = $('#cus_length').val();
            dataExamine.examine['cus_cctc'] = $('#cus_cctc').val(); // chiều cao tiêu chuẩn
            dataExamine.examine['cus_cntc'] = $('#cus_cntc').val(); // cân nặng tiêu chuẩn
            dataExamine.examine['cus_cnht'] = $('#cus_cnht').val(); // cân nặng hiện tại
            dataExamine.examine['cus_cnbt'] = $('#cus_cnbt').val(); // cân nặng thường có
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
            dataExamine.examine['active_mode_of_living_id'] = $('#active_mode_of_living_id').val();
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
            dataExamine.examine['menu_example'] = JSON.stringify(dataExamine.menuExamine);
            break;
        case 4:
            dataExamine.examine['prescription'] = JSON.stringify(dataExamine.prescription);
            break;
        case 5:
            dataExamine.examine['medical_test'] = JSON.stringify(dataExamine.medicalTest);
            break;
        default: break;
    }
    dataExamine.tab = tab;
    if(tab == 5){
        if(dataExamine.isGetListMedicalTest == 0){
            dataExamine.isGetListMedicalTest = 1;
            $('#medical_test_type').trigger('change');
        }
    }
}

function diff_years(dt2, dt1) 
 {
    let diff =(dt2.getTime() - dt1.getTime()) / 1000;
    //ngày
    diff /= (60 * 60 * 24);
    let year_old = Math.abs(diff/365.25);
    let type_year_old = 1;
    if(year_old >= 18){
        year_old = Math.floor(year_old);
    }else if(year_old >= 5.5){
        let year_round = Math.round(parseFloat(year_old.toFixed(1)));
        if(year_round !== year_old){
            if(year_round > year_old){
                year_old = year_round - 0.5;
            }else{
                year_old = year_round;
            }
        }
    }else if(year_old > 5){
        year_old = 5.5;
    }else{
        type_year_old = 0;
        year_old = Math.floor(Math.abs(diff/30.43));
    }
    if(type_year_old == 0){
        $('label[for="cus_age"]').text("Tháng");
        if(year_old == 0) year_old = 1;
    }else{
        $('label[for="cus_age"]').text("Tuổi");
    }
    // return Math.floor(Math.abs(diff/365.25));
    return year_old;
 }

 function caculateYearOld(selectedDates, dateStr, instance){
    let cus_birthday = new Date(dateStr.split("-").reverse().join("-"));
    let now = new Date();
    let yearOld = diff_years(now, cus_birthday);
    if(yearOld > 0){
        $('#cus_age').val(yearOld);
    }
 }

 function checkStandardWeightHeight(){
    try {
        let year_old = $('#cus_age').val();
        let type_year_old = $('label[for="cus_age"]').text() == 'Tuổi' ? 1 : 0;
        let gender = parseInt($('#cus_gender').val());
        $('#cus_cctc').val('');
        $('#cus_cntc').val('');
        if(type_year_old == 1 && parseInt(year_old) > 18){
            $('label[for="cus_cntc"]').text('CNKN (kg)');
            if($('#cus_length').val() && !isNaN(parseFloat($('#cus_length').val()))){
                let ccht = parseFloat($('#cus_length').val());
                let cnkn = ccht * ccht * 22;
                $('#cus_cntc').val(parseInt(cnkn));
            }
        }else{
            if((gender == 1 || gender == 0) && year_old){
                let loading = $("#loading-page");
                let url = '/examine/search/standard-weight-height';
                $.ajax({
                    type: 'POST',
                    url: url,
                    data: {year_old: year_old, type_year_old: type_year_old, gender: gender},
                    beforeSend: function() {
                        loading.show();
                    },
                    success: function(result) {
                        loading.hide();
                        if (result.success && result.data && result.data.length > 0) {
                            if(result.data[0].height) $('#cus_cctc').val((parseFloat(result.data[0].height)/100));
                            if(result.data[0].weight) $('#cus_cntc').val(result.data[0].weight);
                        }
                    },
                    error: function(jqXHR, exception) {
                        loading.hide();
                        ajax_call_error(jqXHR, exception);
                    }
                });
            }
        }
    } catch (error) {
        
    }
 }

 function caculateBMI(){
    try {
        let height = $('#cus_length').val();
        let weight = $('#cus_cnht').val();
        if(height && weight){
            let bmi = weight / (height * height);
            $('#cus_bmi').val(bmi.toFixed(2));
        }
    } catch (error) {
        
    }
 }

 function addMedicine(){
    let medicine_id = parseInt($('#medicine_id').val());
    let medicine_name = $('#medicine_id').find(':selected').text();
    if(!medicine_id){
        displayError('Chưa chọn thuốc!');
        return;
    }
    let medicine_total = $('#total_medinice').val();
    if(!medicine_total || medicine_total == 0 || isNaN(medicine_total)){
        displayError('Thiếu số lượng!');
        return;
    }
    let medicine_unit = $('#unit_medinice').val();
    let medicine_note = $('#use_medinice').val();
    let prescriptionItem = {
        stt: dataExamine.id_prescription++,
        name: medicine_name,
        id: medicine_id,
        total: parseInt(medicine_total),
        unit: medicine_unit,
        note: medicine_note
    }
    if(dataExamine.prescription.length == 0){
        dataExamine.prescription.push(prescriptionItem);
    }else{
        let isExist = false;
        for(let item of dataExamine.prescription){
            if(item.id == prescriptionItem.id){
                isExist = true;
                item.total = parseInt(item.total) + parseInt(prescriptionItem.total);
                item.note = prescriptionItem.note;
                break;
            }
        }
        if(!isExist){
            dataExamine.prescription.push(prescriptionItem);
        }
    }
    
    if(dataExamine.prescription.length > 0){
        $("#tb_prescription").show();
    }else{
        $("#tb_prescription").hide();
    }
    addHtmlPrescription(prescriptionItem);
 }

 function addHtmlPrescription(prescriptionItem){
    let status = parseInt($('#status_examine').val());
    let isLockInput = (status == 4 || (status == 3 && dataExamine.isDetail == 'true')) ? true : false;
    let tr = document.createElement("tr");
    $(tr).attr('id', 'tr_' + prescriptionItem.id);

    let td1  = document.createElement("td");
    let td2  = document.createElement("td");
    let td3  = document.createElement("td");
    let td4  = document.createElement("td");

    $(td3).addClass("min-w-150px")
        .append($("<input/>")
            .attr({"type":"text", "value": prescriptionItem.note, "readonly": isLockInput})
            .addClass("form-control form-control-title p-1 fs-13px")
            .data( "medicine_id",  prescriptionItem.id)
            .change(function(){
                let id = $(this).data('medicine_id');
                let value = $(this).val();
                changeMedicine(id, value, 'note');
            })
        );
    
    $(td4).append($("<input/>")
            .attr({"type":"text", "value": prescriptionItem.total, "readonly": isLockInput})
            .addClass("form-control form-control-title p-1 fw-14px text-red")
            .data( "medicine_id",  prescriptionItem.id)
            .change(function(){
                let id = $(this).data('medicine_id');
                let value = parseInt($(this).val());
                if(isNaN(value)){
                    displayErrorToastr('Số lượng thuốc không đúng định dạng!')
                }else{
                    changeMedicine(id, value, 'total');
                }
            })
        );

    let td5  = document.createElement("td");
    let td6  = document.createElement("td");

    $(td2).attr({class:'min-w-150px fw-14px'});
    $(td5).attr({class:'fs-13px text-primary'});

    let button = document.createElement("button");
    let div = document.createElement("div");
    $(div).attr({class: 'flex-center-x gap-10px'});

    var svgElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    $(svgElem).attr({class:'iconsvg-trash'});
	useElem = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    useElem.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '/public/content/images/sprite.svg#trash');
    svgElem.append(useElem);

    button.appendChild(svgElem);

    button.dataset.id = prescriptionItem.id;
    button.dataset.name = prescriptionItem.name;

    $(button).attr({class:'btn btn-action btn-action-cancel',type:'button'});
    $(button).click(function() {
        let id = $(this).data('id');
        let name = $(this).data('name');
        showConfirmDeleteMedicine(id, name);
    });

    $(td1).text(prescriptionItem.stt);
    $(td2).text(prescriptionItem.name);
    $(td5).text(prescriptionItem.unit);

    div.append(button);
    td6.append(div);
    tr.append(td1);
    tr.append(td2);
    tr.append(td3);
    tr.append(td4);
    tr.append(td5);
    
    if(isLockInput){
        $('#active_table_medicine').hide();
    }else{
        tr.append(td6);
    }
    $('#tb_prescription table tbody').append(tr);
 }

function showConfirmDeleteMedicine(id, name){
    var confirmBox = `
    <div class="modal fade" id="modal_cf_delete_medicine" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <button class="modal-btn-close btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
          <h4 class="modal-title text-center mb-4">Bạn muốn xóa <span class="text-tra-lai">`+ name +`</span> khỏi danh sách không?</h4>
          
          <div class="row g-2 justify-content-center">
            <div class="col-6">
              <button class="btn btn-cancel box-btn w-100 text-uppercase" type="button" data-bs-dismiss="modal">Không</button>
            </div>
            <div class="col-6">
              <button onclick="deleteMedicine(`+ id +`)" class="btn btn-primary box-btn w-100 text-uppercase" type="button" data-bs-dismiss="modal">
                <svg class="iconsvg-confirm flex-shrink-0 fs-16px me-2">
                  <use xlink:href="/public/content/images/sprite.svg#confirm"></use>
                </svg>
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  $("#modal_confirm_box").html(confirmBox); 
  $("#modal_cf_delete_medicine").modal('show');
}

function deleteMedicine(id){
    try {
        if(id){
            $('#tr_' + id).remove();
            removeItemArrayByIdObject(dataExamine.prescription, id);
        }
    } catch (error) {
        
    }
}

function changeMedicine(id, value, type){
    try {
        console.log("changeTotalMedicine", id, value);
        if(id && value){
            for(let item of dataExamine.prescription){
                if(item.id == id){
                    item[type] = value;
                }
            }
        }
    } catch (error) {
        
    }
}
// xóa phần từ trong mảng
function removeItemArray(arr, val) {
    var j = 0;
    for (var i = 0, l = arr.length; i < l; i++) {
      if (arr[i] !== val) {
        arr[j++] = arr[i];
      }
    }
    arr.length = j;
}

// xóa phần từ object trong mảng bằng id
function removeItemArrayByIdObject(arr, id) {
    var j = 0;
    for (var i = 0, l = arr.length; i < l; i++) {
      if (arr[i].id !== id) {
        arr[j++] = arr[i];
      }
    }
    arr.length = j;
}

function getMedicalTest(id){
    if(id){
        let isChecked = $(id).is(':checked');
        let id_medical_test = parseInt($(id).val());
        if(isChecked){
            if(!dataExamine.medicalTest.includes(id_medical_test)){
                dataExamine.medicalTest.push(id_medical_test);
            };
        }else{
            if(dataExamine.medicalTest.includes(id_medical_test)){
                removeItemArray(dataExamine.medicalTest, id_medical_test);
            };
        }
    }
}

function addPrescriptionEdit(){
    if(dataExamine.prescription && dataExamine.prescription.length > 0){
        $("#tb_prescription").show();
        for(let [i, item] of dataExamine.prescription.entries()){
            addHtmlPrescription(item);
            if(i == (dataExamine.prescription.length - 1)){
                dataExamine.id_prescription = item.stt + 1
            }
        }
    }else{
        $("#tb_prescription").hide();
    }
}

function generateFoodName(id){
    $('#' + id).select2({
        minimumInputLength: 2,
        language: {
            inputTooShort: function() {
                return "Vui lòng nhập ít nhất 2 ký tự";
            },
            noResults: function(){
               return "Không có kết quả được tìm thấy";
            },
            searching: function() {
                return "Đang tìm kiếm...";
            }
        },
        escapeMarkup: function (markup) {
            return markup;
        },
        placeholder: 'Chọn thực phẩm',
        allowClear: true,
        ajax: {
            url: function (params) {
                return '/examine/suggest/food-name'
            },
            delay: 1000,
            dataType: 'json',
            processResults: function (data) {
                if(data.success){
                    dataExamine.foodNameListSearch = data.data;
                    // for(let item of data.data){
                    //     if(dataExamine.foodNameListSearch.findIndex(s => s.id == item.id) == -1){
                    //         dataExamine.foodNameListSearch.push(item);
                    //     }
                    // }
                }
                return { 
                    results: $.map(data.data, function (item) {
                        return {
                            text: item.name,
                            id: item.id,
                            weight: item.weight,
                            energy: item.energy,
                            protein: item.protein,
                            animal_protein: item.animal_protein,
                            lipid: item.lipid,
                            unanimal_lipid: item.unanimal_lipid,
                            carbohydrate: item.carbohydrate
                        }
                    })
                };
            }
        }
    });
}

function deleteFood(id_food, id_menu_time){
    try {
        let menu_id = parseInt($('#menu_id').val());
        for(let menu of dataExamine.menuExamine){
            if(menu.id = menu_id){
                for(let menu_time of menu.detail){
                    if(menu_time.id == id_menu_time){
                        removeItemArrayByIdObject(menu_time.listFood, id_food);
                        break;
                    }
                }
            }
        }
        $('#food_' + id_menu_time + "_" + id_food).remove();
        let rowspan = $('#menu_time_' + id_menu_time + ' td:first-child').attr("rowspan");
        
        $('#menu_time_' + id_menu_time + ' td:first-child').attr('rowspan', (rowspan - 1));
    } catch (error) {

    }
}

function caculateFoodInfo(food, weight){
    try {
        if(food && weight > 0){
            food.energy = Math.round((food.energy * weight) / food.weight);
            food.protein = Math.round(((food.protein * weight) / food.weight) * 100) / 100;
            food.animal_protein = Math.round(((food.animal_protein * weight) / food.weight) * 100) /100;
            food.lipid = Math.round(((food.lipid * weight) / food.weight) * 100) / 100;
            food.unanimal_lipid = Math.round(((food.unanimal_lipid * weight) / food.weight) * 100) / 100;
            food.carbohydrate = Math.round(((food.carbohydrate * weight) / food.weight) * 100) / 100;
            food.weight = weight
        }
    } catch (error) {
        
    }
}

function changeWeightFood(id_food, menuTime_id, value){
    try {
        let menu_id = parseInt($('#menu_id').val());
        for(let menu of dataExamine.menuExamine){
            if(menu_id == menu.id){
                let listFoodTotal = [];
                for(let item of menu.detail){
                    if(menuTime_id == item.id){
                        for(let food of item.listFood){
                            if(id_food == food.id){
                                caculateFoodInfo(food, value);
                                $("#food_"+ menuTime_id + "_" + food.id + "_energy").text(food.energy);
                                $("#food_"+ menuTime_id + "_" + food.id + "_protein").text(food.protein);
                                $("#food_"+ menuTime_id + "_" + food.id + "_animal_protein").text(food.animal_protein);
                                $("#food_"+ menuTime_id + "_" + food.id + "_lipid").text(food.lipid);
                                $("#food_"+ menuTime_id + "_" + food.id + "_unanimal_lipid").text(food.unanimal_lipid);
                                $("#food_"+ menuTime_id + "_" + food.id + "_carbohydrate").text(food.carbohydrate);
                                break;
                            }
                        }
                    }
                    listFoodTotal.push(...item.listFood);
                }
                setTotalMenu(listFoodTotal);
                break;
            }
        }
    } catch (error) {
        
    }
}

function changeCourse(menuTime_id){
    try {
        let name_course = $('#menu_time_' + menuTime_id).find("input").val();
        let menu_id = parseInt($('#menu_id').val());
        for(let menu of dataExamine.menuExamine){
            if(menu_id == menu.id){
                for(let item of menu.detail){
                    if(menuTime_id == item.id){
                        item.name_course = name_course;
                        break;
                    }
                }
                break;
            }
        }
    } catch (error) {
        
    }
}

function generateMenuExamine(){
    // if(dataExamine.menuExamine && dataExamine.menuExamine.length == 0){
    //     let menu = addMenuList();
    //     dataExamine.menuExamine.push(menu);
    // }
    if(dataExamine.menuExamine && dataExamine.menuExamine.length > 0){
        for(let [i, item] of dataExamine.menuExamine.entries()){
            let newOption = new Option(item.name, item.id, false, false);
            if(i == (dataExamine.menuExamine.length - 1)){
                $('#menu_id').append(newOption).trigger('change');
            }else{
                $('#menu_id').append(newOption);
            }
            if(i == 0){
                let listFoodTotal = [];
                for(let menuTime of item.detail){
                    listFoodTotal.push(...menuTime.listFood);
                }
                setTotalMenu(listFoodTotal);
            }
        }
        let menu_id = parseInt($('#menu_id').val() ? $('#menu_id').val() : 0);
        generateTableMenu(menu_id);
    }
}

function addMenuList(){
    let id = 1;
    if(dataExamine.menuExamine.length > 0){
        id = dataExamine.menuExamine[dataExamine.menuExamine.length - 1].id + 1;
    }
    let menu = {
        id: id,
        name: "Thực đơn " + id,
        detail: [],
        note: ''
    }
    for(let time of dataExamine.listMenuTime){
        menu.detail.push({
            "id": time.id, 
            "name": time.name,
            "name_course":'',
            "listFood":[]
        });
    }
    return menu;
}

function generateTableMenu(menu_id){
    try {
        // let menu_id = parseInt($("#menu_id").val());
        if(menu_id){
            if(dataExamine.menuExamine.length > 0){
                for(let menu of dataExamine.menuExamine){
                    if(menu.id == menu_id){
                        $('#name_menu').val(menu.name);
                        $('#menu_example_note').val(menu.note);
                        addTemplateListMenuTime(menu.detail);
                        break;
                    }
                }
            }
            $('#tb_menu').show();
        }else{
            $('#tb_menu').hide();
        }
    } catch (error) {
        
    }
}

function addTemplateListMenuTime(listMenuTime){
    try {
        if(listMenuTime.length > 0){
            for(let item of listMenuTime){
                let menuTime = addTemplateMenuTime(item);
                $("#tb_menu").find('tbody').append(menuTime);
                if(item.listFood.length > 0){
                    for(let food of item.listFood){
                        let foodTemplate = addFoodTemplate(food, item.id);
                        $("#tb_menu").find('tbody').append(foodTemplate);
                    }
                }
            }
        }
    } catch (error) {
        
    }
}

function addMenu(){
    try {
        //thêm menu trống
        let menuNew = addMenuList();
        dataExamine.menuExamine.push(menuNew);
        //thêm select menu
        let newOption = new Option(menuNew.name, menuNew.id, false, false);
        $('#menu_id').append(newOption).trigger('change');
        resetTemplateMenu();
        //tạo template menu
        generateTableMenu(menuNew.id);
        $('#tb_menu').show();
    } catch (error) {
        
    }
}

function resetTemplateMenu(){
    //Xóa template menu hiện tại
    $('#tb_menu').find('tbody').empty();
    $('#menu_example_note').val('');
    $('#total_energy').text('');
    $('#total_protein').text('');
    $('#total_animal_protein').text('');
    $('#total_lipid').text('');
    $('#total_unanimal_lipid').text('');
    $('#total_carbohydrate').text('');
}

function chooseMenuExample(){
    try {
        let id = 1;
        if(dataExamine.menuExamine.length > 0){
            id = dataExamine.menuExamine[dataExamine.menuExamine.length - 1].id + 1;
        }
        let menu_example_id = parseInt($("#menuExample_id").val());
        if(menu_example_id){
            for(let menu of dataExamine.menuExample){
                if(menu.id == menu_example_id){
                    let menuNew = {
                        id: id,
                        name: menu.name_menu,
                        detail: JSON.parse(menu.detail)
                    };
                    dataExamine.menuExamine.push(menuNew);
                    let newOption = new Option(menuNew.name, menuNew.id, false, false);
                    $('#menu_id').append(newOption).trigger('change');
                    break;
                }
            }
            $('#tb_menu').show();
            generateTableMenu(id);
        }else{
            displayError("Vui lòng chọn mẫu!");
        }
    } catch (error) {
        
    }
}

function addFoodToMenu(){
    try {
        let menu_id = parseInt($('#menu_id').val());
        if(menu_id && dataExamine.menuExamine.length > 0){
            for(let item of dataExamine.menuExamine){
                if(menu_id == item.id){
                    let menuTime_id = parseInt($('#menuTime_id').val());
                    if(menuTime_id){
                        if(item.detail.length > 0){
                            let listFoodTotal = [];
                            for(let menuTime of item.detail){
                                // menuTime.name_course = $('#course').val();
                                // $('#menu_time_' + menuTime_id).find('input').val($('#course').val());
                                if(menuTime_id == menuTime.id){
                                    let id = menuTime.listFood.length == 0 ? 1 : menuTime.listFood[menuTime.listFood.length - 1].id + 1;
                                    let food = {
                                        "id": id,
                                        "id_food": parseInt($('#food_name').val()),
                                        "name": $('#food_name').find(':selected').text(),
                                        "weight": parseInt($('#weight_food').val()),
                                        "energy": isNaN(parseInt($('#energy_food').val())) ? 0 : parseInt($('#energy_food').val()),
                                        "protein": isNaN(parseFloat($('#protein_food').val())) ? 0 : parseFloat($('#protein_food').val()),
                                        "animal_protein": isNaN(parseFloat($('#animal_protein').val())) ? 0 : parseFloat($('#animal_protein').val()),
                                        "lipid": isNaN(parseFloat($('#lipid_food').val())) ? 0 : parseFloat($('#lipid_food').val()),
                                        "unanimal_lipid": isNaN(parseFloat($('#unanimal_lipid').val())) ? 0 : parseFloat($('#unanimal_lipid').val()),
                                        "carbohydrate": isNaN(parseFloat($('#carbohydrate').val())) ? 0 : parseFloat($('#carbohydrate').val())
                                    }
                                    menuTime.listFood.push(food);
                                    let foodTemplate = addFoodTemplate(food, menuTime_id);
                                    if(id == 1){
                                        foodTemplate.insertAfter('#menu_time_' + menuTime_id);
                                    }else{
                                        foodTemplate.insertAfter('#food_' + menuTime_id + "_" + (id - 1))
                                    }
                                    $('#menu_time_' + menuTime_id + ' td:first-child').attr('rowspan', (id + 1));
                                }
                                listFoodTotal.push(...menuTime.listFood);
                            }
                            setTotalMenu(listFoodTotal);
                        }else{
                            displayError('Chưa có dữ liệu giờ ăn!');
                        }
                    }else{
                        displayError('Bạn chưa chọn giờ ăn!');
                    }
                    break;
                }
            }
        }else{
            displayError('Tạo mới hoặc chọn menu mẫu!');
        }
    } catch (error) {
        
    }
}

function addTemplateMenuTime(menuTime){
    try {
        let status = parseInt($('#status_examine').val());
        let isLockInput = (status == 4 || (status == 3 && dataExamine.isDetail == 'true')) ? true : false;
        let rowspan = menuTime.listFood.length + 1;
        return $('<tr/>')
            .attr("id", "menu_time_"+ menuTime.id)
            .addClass("text-center")
            .append($("<td/>")
                .css({"writing-mode": "vertical-rl"})
                .attr("rowspan", rowspan)
                .text(menuTime.name)
            )
            .append($("<td/>")
                .append($("<input/>")
                    .attr({"type":"text", "value": menuTime.name_course, "readonly": isLockInput})
                    .addClass("form-control form-control-title p-1")
                    .css({"text-align": "center"})
                    .data( "menu_time_id",  menuTime.id)
                    .change(function(){
                        let id = $(this).data('menu_time_id');
                        changeCourse(id);
                    })
                )
                .attr("colspan", 3)
            )
            .append($("<td/>")
                .attr("colspan", 6)
            );
    } catch (error) {
        
    }
}

function addFoodTemplate(food, menuTime_id){
    try {
        let status = parseInt($('#status_examine').val());
        let isLockInput = (status == 4 || (status == 3 && dataExamine.isDetail == 'true')) ? true : false;
        return $('<tr/>')
        .attr("id", "food_"+ menuTime_id + "_" + food.id)
        .append($("<td/>")
            .text(food.name)
        )
        .append($("<td/>")
            .attr("id", "food_"+ menuTime_id + "_" + food.id + "_weight")
            .append($("<input/>")
                .attr({"type":"number", "value": food.weight, "readonly": isLockInput})
                .addClass("form-control form-control-title p-1")
                .data( "food_id",  food.id)
                .data( "menu_time_id",  menuTime_id)
                .change(function(){
                    let idFood = $(this).data('food_id');
                    let idMenuTime = $(this).data('menu_time_id');
                    let weight = $(this).val();
                    changeWeightFood(idFood, idMenuTime, weight);
                })
            )
        )
        .append($("<td/>")
            .attr("id", "food_"+ menuTime_id + "_" + food.id + "_energy")
            .text(food.energy)
        )
        .append($("<td/>")
            .attr("id", "food_"+ menuTime_id + "_" + food.id + "_protein")
            .text(food.protein)
        )
        .append($("<td/>")
            .attr("id", "food_"+ menuTime_id + "_" + food.id + "_animal_protein")
            .text(food.animal_protein)
        )
        .append($("<td/>")
            .attr("id", "food_"+ menuTime_id + "_" + food.id + "_lipid")
            .text(food.lipid)
        )
        .append($("<td/>")
            .attr("id", "food_"+ menuTime_id + "_" + food.id + "_unanimal_lipid")
            .text(food.unanimal_lipid)
        )
        .append($("<td/>")
            .attr("id", "food_"+ menuTime_id + "_" + food.id + "_carbohydrate")
            .text(food.carbohydrate)
        )
        .append($("<td/>")
            .append($(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width=".8rem" heigh=".8rem">
                        <path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/>
                    </svg>`)
                    .css({"display": isLockInput ? 'none' : 'block'}))
            .css({"cursor": "pointer", "pointer-events": isLockInput ? 'none' : 'auto'})
            .data( "food_id",  food.id)
            .data( "menu_time_id",  menuTime_id)
            .click(function(){
                let idFood = $(this).data('food_id');
                let idMenuTime = $(this).data('menu_time_id');
                deleteFood(idFood, idMenuTime);
            })
        );
    } catch (error) {
        
    }
}

function importExcelFile(){
    try {
      $('#file_input_excel').trigger('click');
    } catch (error) {

    }
}

function getFileExcel(){
    try {
        let dataFile = $('#file_input_excel').prop('files');
        readXlsxFile(dataFile[0]).then(function(rows) {
            console.log("getFileExcel data", rows);
        });
    } catch (error) {

    }
}

function setTotalMenu(listFood){
    try {
        if(listFood.length > 0){
            let total_energy = 0, total_protein = 0, total_animal_protein = 0, total_lipid = 0, 
            total_unanimal_lipid = 0, total_carbohydrate = 0;
            for(let food of listFood){
                total_energy += food.energy;
                total_protein += food.protein;
                total_animal_protein += food.animal_protein;
                total_lipid += food.lipid;
                total_unanimal_lipid += food.unanimal_lipid;
                total_carbohydrate += food.carbohydrate;
            }
            $('#total_energy').text(String(total_energy));
            $('#total_protein').text(parseFloat(total_protein).toFixed(2));
            $('#total_animal_protein').text(parseFloat(total_animal_protein).toFixed(2));
            $('#total_lipid').text(parseFloat(total_lipid).toFixed(2));
            $('#total_unanimal_lipid').text(parseFloat(total_unanimal_lipid).toFixed(2));
            $('#total_carbohydrate').text(parseFloat(total_carbohydrate).toFixed(2));
        }
    } catch (error) {
        
    }
}

function saveMenu(isCreate){
    try {
        let loading = $("#loading-page");
        let url = '/examine/save-menu';
        let menu_id = parseInt($('#menu_id').val());
        let data = {isCreate: isCreate, name: $("#name_menu").val()};
        for(let menu of dataExamine.menuExamine){
            if(menu_id == menu.id){
                data['detail'] = JSON.stringify(menu.detail);
            }
        }
        if(isCreate == 0){
            data['menu_id'] = parseInt($('#menuExample_id').val());
            if(isNaN(data['menu_id']) || !data.menu_id){
                displayMessageToastr('Chưa chọn menu mẫu');
            }
        }
        $.ajax({
            type: 'POST',
            url: url,
            data: data,
            beforeSend: function() {
                $('#modal-cf-save-menu').modal('hide');
                loading.show();
            },
            success: function(result) {
                loading.hide();
                if (result.success) {
                    displayMessageToastr('Lưu mẫu thành công');
                } else {
                    displayErrorToastr(result.message);
                }
            },
            error: function(jqXHR, exception) {
                loading.hide();
                ajax_call_error(jqXHR, exception);
            }
        });
    } catch (error) {
        
    }
}

function viewDetailExamine(id){
    try {
        let loading         = $("#loading-page");
        if(id){
            let url = '/examine/detail-examine';
            $.ajax({
                type: 'POST',
                url: url,
                data: {id: id},
                beforeSend: function() {
                    loading.show();
                },
                success: function(result) {
                    loading.hide();
                    if (result.success && result.data) {
                        $("#modal-chi-tiet-phieu-kham").find('.table-responsive-inner').html(result.data);
                        $("#modal-chi-tiet-phieu-kham").find('.modal-header').html(
                            `<h3 class="modal-title fs-16px text-uppercase mb-0">Chi tiết phiếu khám</h3>`
                        );

                        $('#modal-chi-tiet-phieu-kham').find("#btn-detail-examine").html(`
                            <div class="col-sm-6 col-md-auto">
                                <button class="btn btn-cancel box-btn w-100 text-uppercase" type="button" data-bs-dismiss="modal">Đóng</button>
                            </div>`);
                        
                        $('#modal-chi-tiet-phieu-kham').modal('show');
                    } else {
                        displayErrorToastr(result.message);
                    }
                },
                error: function(jqXHR, exception) {
                    loading.hide();
                    ajax_call_error(jqXHR, exception);
                }
            });
        }
    } catch (error) {
        
    }
}

function generateTableMenuSearch(id){
    try {
        if(dataExamine.menuExamine.length > 0){
            for(let menu of dataExamine.menuExamine){
                if(id == menu.id){
                    addTemplateListMenuTimeSearch(menu.detail);
                    break;
                }
            }
        }
    } catch (error) {
        
    }
}

function addTemplateListMenuTimeSearch(listMenuTime){
    try {
        // if(listMenuTime.length > 0){
        //     for(let item of listMenuTime){
        //         let menuTime = addTemplateMenuTimeSearch(item);
        //         $("#tb_menu").find('tbody').append(menuTime);
        //         if(item.listFood.length > 0){
        //             for(let food of item.listFood){
        //                 let foodTemplate = addFoodTemplateSearch(food, item.id);
        //                 $("#tb_menu").find('tbody').append(foodTemplate);
        //             }
        //         }
        //     }
        // }
        if(listMenuTime.length > 0){
            for(let item of listMenuTime){
                let menuTime = addTemplateMenuTimeSearch2(item);
                $("#list_menu_example").append(menuTime);
                if(item.listFood.length > 0){
                    for(let food of item.listFood){
                        let foodTemplate = addFoodTemplateSearch2(food, item.name_course);
                        $("#menu_time_food_" + item.id).append(foodTemplate.food);
                        $("#menu_time_weight_" + item.id).append(foodTemplate.weight);
                    }
                }
            }
        }
    } catch (error) {
        
    }
}

// function addTemplateMenuTimeSearch(menuTime){
//     try {
//         let rowspan = menuTime.listFood.length + 1;
//         return menuTimeTemplate = $('<tr/>')
//             .attr("id", "menu_time_"+ menuTime.id)
//             .addClass("text-center")
//             .append($("<td/>")
//                 .css({"writing-mode": "vertical-rl"})
//                 .attr("rowspan", rowspan)
//                 .text(menuTime.name)
//             )
//             .append($("<td/>")
//                 .text(menuTime.name_course)
//                 .css({"text-align": "center"})
//                 .attr("colspan", 2)
//             );
//     } catch (error) {
        
//     }
// }

// function addFoodTemplateSearch(food, menuTime_id){
//     try {
//         return $('<tr/>')
//         .attr("id", "food_"+ menuTime_id + "_" + food.id)
//         .append($("<td/>")
//             .text(food.name)
//             .css({"text-align": "center"})
//         )
//         .append($("<td/>")
//             .attr("id", "food_"+ menuTime_id + "_" + food.id + "_weight")
//             .text(food.weight)
//             .css({"text-align": "center"})
//         );
//     } catch (error) {
        
//     }
// }

function addTemplateMenuTimeSearch2(menuTime){
    try {
        return menuTimeTemplate = $('<div/>')
            .attr("id", "menu_time_"+ menuTime.id)
            .addClass("row mt-0")
            .append($("<div/>")
                .addClass("col-2 px-2 py-2")
                .css({"writing-mode": "vertical-rl", "display":"flex", "justify-content":"center","align-items":"center"})
                .text(menuTime.name)
            )
            .append($("<div/>")
                .attr("id", "menu_time_food_"+ menuTime.id)
                .addClass("col-7 text-center")
            )
            .append($("<div/>")
                .attr("id", "menu_time_weight_"+ menuTime.id)
                .addClass("col-3")
            );
    } catch (error) {
        
    }
}

function addFoodTemplateSearch2(food, name_course){
    try {
        let temp_food = $('<div/>')
            .text(food.name)
            .addClass("px-2 py-2");
        let weight = $('<div/>')
            .text(food.weight)
            .addClass("px-2 py-2");
        return {food: temp_food, weight: weight};
    } catch (error) {
        
    }
}

function showHistory(){
    try {
        let customer_id = parseInt($('#phone_search').val());
        if(customer_id){
            let loading         = $("#loading-page");
            let url = '/examine/table/history';
            $.ajax({
                type: 'POST',
                url: url,
                data: {cus_id: customer_id},
                beforeSend: function() {
                    loading.show();
                },
                success: function(result) {
                    loading.hide();
                    if (result.success && result.data) {
                        $('#table_history').html(result.data);
                    } else {
                        displayErrorToastr(result.message);
                    }
                },
                error: function(jqXHR, exception) {
                    loading.hide();
                    ajax_call_error(jqXHR, exception);
                }
            });
        }else{
            displayErrorToastr("Vui lòng nhập số điện thoại tìm kiếm");
        }
    } catch (error) {
        
    }
}

function showConfirmSaveMenu(){
    try {
        $('#modal-cf-save-menu').modal('show');
    } catch (error) {
        
    }
}

function encodeImageFileAsURL() {

    var filesSelected = document.getElementById("inputFileToLoad").files;
    if (filesSelected.length > 0) {
      var fileToLoad = filesSelected[0];

      var fileReader = new FileReader();

      fileReader.onload = function(fileLoadedEvent) {
        var srcData = fileLoadedEvent.target.result; // <--- data: base64
        $('#avatar').val(srcData);
        $('#imgTest').attr('src', srcData);
      }
      fileReader.readAsDataURL(fileToLoad);
    }
}

function cancelExamine(id, status){
    try {
        if(id){
            let loading = $("#loading-page");
            let url = '/examine/cancel';
            $.ajax({
                type: 'POST',
                url: url,
                data: {id: id, status: status},
                beforeSend: function() {
                    loading.show();
                },
                success: function(result) {
                    loading.hide();
                    if (result.success) {
                        displayMessageToastr(result.message);
                        if(status && status == 4){
                            $('#examine_' + id).remove();
                        }else{
                            window.location.href = '/examine';
                        }
                    } else {
                        displayErrorToastr(result.message);
                    }
                },
                error: function(jqXHR, exception) {
                    loading.hide();
                    ajax_call_error(jqXHR, exception);
                }
            });
        }
    } catch (error) {
        
    }
}

function showModalCancelExamine(id, status){
    try {
        var confirmBox = `
        <div class="modal fade" id="modal_cf_cancel_examine" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <button class="modal-btn-close btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
                <div class="text-center mb-2">
                <svg class="iconsvg-trash-lg text-tra-lai fs-65px">
                    <use xlink:href="/public/content/images/sprite.svg#trash-lg"></use>
                </svg>
                </div>
                <h4 class="modal-title text-center text-tra-lai mb-4">Huỷ phiếu khám</h4>
                <p class="text-body-2 fw-5 text-center mb-4">Bạn muốn hủy phiếu khám này không?</p>
                <div class="row g-2 justify-content-center">
                <div class="col-6">
                    <button class="btn btn-cancel box-btn w-100 text-uppercase" type="button" data-bs-dismiss="modal">Không</button>
                </div>
                <div class="col-6">
                    <button onclick="cancelExamine(`+ id +`,`+ status +`)" class="btn btn-primary box-btn w-100 text-uppercase" type="button" data-bs-dismiss="modal">
                    <svg class="iconsvg-confirm flex-shrink-0 fs-16px me-2">
                        <use xlink:href="/public/content/images/sprite.svg#confirm"></use>
                    </svg>
                    Đồng ý
                    </button>
                </div>
                </div>
            </div>
            </div>
        </div>`;
        $("#modal_confirm_box").html(confirmBox); 
        $("#modal_cf_cancel_examine").modal('show');
    } catch (error) {
        
    }
}

$(document).ready(function(){
    let cus_birthday = $("#cus_birthday").flatpickr({
        dateFormat: "d-m-Y",
        maxDate: "today",
        allowInput: true,
        onChange: function(selectedDates, dateStr, instance) {
            caculateYearOld(selectedDates, dateStr, instance);
            checkStandardWeightHeight();
        },
        onReady: function(selectedDates, dateStr, instance) {
            caculateYearOld(selectedDates, dateStr, instance);
            checkStandardWeightHeight();
        }
    });

    $("#nutrition_advice_id").on('select2:select', function(evt) {
        if(dataExamine.nutritionAdviceList.length > 0){
            for(let item of dataExamine.nutritionAdviceList){
                if(evt.params.data.id == item.id){
                    $('#nutrition_advice textarea').each(function () {
                        this.setAttribute('style', 'height:auto;');
                    });
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

                    $('#nutrition_advice textarea').each(function () {
                        this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
                    });
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

    $("#medicine_id").on('select2:select', function(evt) {
        if(dataExamine.medicineList.length > 0){
            for(let item of dataExamine.medicineList){
                if(evt.params.data.id == item.id){      
                    $("#unit_medinice").val(item.unit);
                    $("#use_medinice").val(item.description);
                    break;
                }
            }
        }
    });

    $("#food_name").on('select2:select', function(evt) {
        if(dataExamine.foodNameListSearch.length > 0){
            for(let item of dataExamine.foodNameListSearch){
                if(evt.params.data.id == item.id){      
                    $("#weight_food").val(item.weight);
                    $("#weight_food").data('initial-value',item.weight);
                    $("#energy_food").val(item.energy);
                    $("#protein_food").val(item.protein);
                    $("#animal_protein").val(item.animal_protein);
                    $("#lipid_food").val(item.lipid);
                    $("#unanimal_lipid").val(item.unanimal_lipid);
                    $("#carbohydrate").val(item.carbohydrate);
                    break;
                }
            }
        }
    });

    $("#menu_id").on('select2:select', function(evt) {
        $("tbody tr").remove();
        generateTableMenu(evt.params.data.id);
    }).on('select2:unselect', function(e){

    });

    $("#diagnostic_id").on('select2:select', function(evt) {
        if(dataExamine.diagnostic.length > 0){
            for(let item of dataExamine.diagnostic){
                if(evt.params.data.id == item.id){      
                    $("#diagnostic_suggest").text(item.detail);
                    break;
                }
            }
        }
    });

    $('#phone_search').select2({
        minimumInputLength: 3,
        language: {
            inputTooShort: function() {
                return "Vui lòng nhập ít nhất 3 ký tự";
            },
            noResults: function(){
               return "Không có kết quả được tìm thấy";
            },
            searching: function() {
                return "Đang tìm kiếm...";
            }
        },
        escapeMarkup: function (markup) {
            return markup;
        },
        placeholder: 'Nhập số điện thoại',
        allowClear: true,
        ajax: {
            url: function (params) {
                return '/examine/suggest/phone'
            },
            delay: 1000,
            dataType: 'json',
            processResults: function (data) {
                if(data.success){
                    dataExamine.phoneListSearch = data.data;
                }
                return { 
                    results: $.map(data.data, function (item) {
                        return {
                            text: item.cus_name + " - " + new Date(item.cus_birthday).toLocaleDateString('pt-PT') + " - " + (item.cus_gender == 0 ? "Nữ" : (item.cus_gender ==  1 ? "Nam" : "Khác") + " - " + item.cus_address),
                            id: item.id
                        }
                    })
                };
            }
        }
    });

    $("#phone_search").on('select2:select', function(evt) {
        if(evt.params.data.id) $('#btn_show_history').show();
        if(dataExamine.phoneListSearch.length > 0){
            for(let item of dataExamine.phoneListSearch){
                if(evt.params.data.id == item.id){      
                    $('#cus_name').val(item.cus_name);
                    $('#cus_phone').val(item.cus_phone);
                    $('#cus_email').val(item.cus_email);
                    $('#cus_gender').val(item.cus_gender).trigger('change');
                    cus_birthday.setDate(moment(item.cus_birthday).format("DD-MM-YYYY"), true);
                    $('#cus_address').val(item.cus_address);
                    break;
                }
            }
        }
    });

    $('#weight_food').change(function(evt){
        let menu_id = parseInt($('#menu_id').val());
        let food_id = parseInt($('#food_name').val());
        if(menu_id && food_id){
            let oldValue = parseInt($("#weight_food").data('initial-value'));
            let currenValue = parseInt($("#weight_food").val());
            let energy = parseFloat($("#energy_food").val());
            let protein = parseFloat($("#protein_food").val());
            let animal_protein = parseFloat($("#animal_protein").val());
            let lipid = parseFloat($("#lipid_food").val());
            let unanimal_lipid = parseFloat($("#unanimal_lipid").val());
            let carbohydrate = parseFloat($("#carbohydrate").val());

            $("#energy_food").val(Math.round((energy * currenValue) / oldValue));
            $("#protein_food").val(Math.round(((protein * currenValue) / oldValue) * 100) / 100);
            $("#animal_protein").val(Math.round(((animal_protein * currenValue) / oldValue) * 100) / 100);
            $("#lipid_food").val(Math.round(((lipid * currenValue) / oldValue) * 100) / 100);
            $("#unanimal_lipid").val(Math.round(((unanimal_lipid * currenValue) / oldValue) * 100) / 100);
            $("#carbohydrate").val(Math.round(((carbohydrate * currenValue) / oldValue) * 100) / 100);
            $("#weight_food").data('initial-value', currenValue);
        }
    });

    $('#cus_gender').on('select2:select', function(evt) {
        checkStandardWeightHeight();
    });

    $('#cus_length').change(function(evt){
        let year_old = $('#cus_age').val();
        let type_year_old = $('label[for="cus_age"]').text() == 'Tuổi' ? 1 : 0;
        if(type_year_old == 1 && parseInt(year_old) > 18){
            checkStandardWeightHeight();
        }
    });

    $('#cus_length, #cus_cnht').change(function(evt){
        caculateBMI();
    });

    $('#medical_test_type').change(function(evt){
        let status = parseInt($('#status_examine').val());
        let isLockInput = (status == 4 || (status == 3 && dataExamine.isDetail == 'true')) ? true : false;
        let id = $('#medical_test_type').val();
        if(!isNaN(parseInt(id))){
            let loading = $("#loading-page");
            let url = '/examine/list/medical-test';
            $.ajax({
                type: 'POST',
                url: url,
                data: {type_id: id, type_name: $('#medical_test_type').find(':selected').text(), data:JSON.stringify(dataExamine.medicalTest), isLockInput: isLockInput},
                beforeSend: function() {
                    loading.show();
                },
                success: function(result) {
                    loading.hide();
                    if (result.success && result.data) {
                        $('#list_medical_test').html(result.data);
                    } else {
                        displayErrorToastr(result.message);
                    }
                },
                error: function(jqXHR, exception) {
                    loading.hide();
                    ajax_call_error(jqXHR, exception);
                }
            });
        }else{
            displayErrorToastr("Không có id loại xét nghiệm!");
        }
    });

    $('textarea').each(function () {
        if(this.scrollHeight !== 0){
            this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
        }else{
            this.setAttribute('style', 'height:auto;');
        }
    }).on('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    $('#menu_example_note').change(function(evt){
        console.log('menu_example_note', evt, $('#menu_example_note').val());
        let menu_id = parseInt($('#menu_id').val());
        for(let menu of dataExamine.menuExamine){
            if(menu_id == menu.id){
                menu.note = $('#menu_example_note').val().trim();
            }
        }
    })
});

