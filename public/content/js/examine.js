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
    // listMenu: [{id:1, name:"Thực đơn 1","detail":[]},{id:2, name:"Thực đơn 2","detail":[]},{id:3, name:"Thực đơn 3","detail":[]}],
    foodNameListSearch: [],
    listMenuTime: [],
    menuExamine: [],
    menuExample: []
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

function exportExamine(){
    try {
        let tab = dataExamine.tab;
        changeTabExamine(1);
        changeTabExamine(2);
        changeTabExamine(4);
        changeTabExamine(tab);
        console.log("exportExamine", dataExamine.examine);
        var link = document.createElement('a');
        link.href = '/export/examine?data=' + encodeURIComponent(JSON.stringify(dataExamine.examine));
        link.click();
        link.remove();
    } catch (error) {
        console.log("exportExamine 2", error);
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
        console.log("exportExamine", dataExamine.examine);
        var link = document.createElement('a');
        link.href = '/export/prescription?data=' + encodeURIComponent(JSON.stringify(dataExamine.examine));
        link.click();
        link.remove();
    } catch (error) {
        console.log("exportExamine 2", error);
    }
}

function changeTabExamine(tab){
    console.log("changeTabExamine", tab, dataExamine.prescription);
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
            dataExamine.examine['diagnostic_id'] = $('#diagnostic_id').val();
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
            console.log("change tab 4", dataExamine.examine['prescription']);
            break;
        case 5:
            dataExamine.examine['medical_test'] = JSON.stringify(dataExamine.medicalTest);
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

 function addMedicine(){
    let medicine_id = parseInt($('#medicine_id').val());
    let medicine_name = $('#medicine_id').find(':selected').text();
    if(!medicine_id){
        displayError('Chưa chọn thuốc!');
        return;
    }
    let medicine_total = $('#total_medinice').val();
    if(!medicine_total || medicine_total == 0){
        displayError('Thiếu số lượng!');
        return;
    }
    let medicine_unit = $('#unit_medinice').val();
    let medicine_note = $('#use_medinice').val();
    let prescriptionItem = {
        stt: dataExamine.id_prescription++,
        name: medicine_name,
        id: medicine_id,
        total: medicine_total,
        unit: medicine_unit,
        note: medicine_note
    }
    dataExamine.prescription.push(prescriptionItem);
    if(dataExamine.prescription.length > 0){
        $("#tb_prescription").show();
    }else{
        $("#tb_prescription").hide();
    }
    addHtmlPrescription(prescriptionItem);
 }

 function addHtmlPrescription(prescriptionItem){
    console.log("addHtmlPrescription", prescriptionItem);
    
    let tr = document.createElement("tr");
    $(tr).attr('id', 'tr_' + prescriptionItem.id);

    let td1  = document.createElement("td");
    let td2  = document.createElement("td");
    let td3  = document.createElement("td");
    let td4  = document.createElement("td");
    let td5  = document.createElement("td");
    let td6  = document.createElement("td");

    $(td2).attr({class:'min-w-150px fw-14px'});
    $(td3).attr({class:'min-w-150px fs-13px'});
    $(td4).attr({class:'fw-14px text-red'});
    $(td5).attr({class:'fs-13px text-primary'});

    let button1 = document.createElement("button");
    let button2 = document.createElement("button");
    let div = document.createElement("div");
    $(div).attr({class: 'flex-center-x gap-10px'});
    var svgElem1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    $(svgElem1).attr({class:'iconsvg-send'});
	useElem1 = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    useElem1.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '/public/content/images/sprite.svg#edit-2');
    svgElem1.append(useElem1);

    var svgElem2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    $(svgElem2).attr({class:'iconsvg-trash'});
	useElem2 = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    useElem2.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '/public/content/images/sprite.svg#trash');
    svgElem2.append(useElem2);

    button1.appendChild(svgElem1);
    button2.appendChild(svgElem2);

    button1.dataset.id = prescriptionItem.id;
    button2.dataset.id = prescriptionItem.id;
    $(button1).attr({class:'btn btn-action btn-action-edit',type:'button'});
    $(button2).attr({class:'btn btn-action btn-action-cancel',type:'button'});
    
    $(td1).text(prescriptionItem.stt);
    $(td2).text(prescriptionItem.name);
    $(td3).text(prescriptionItem.note);
    $(td4).text(prescriptionItem.total);
    $(td5).text(prescriptionItem.unit);
    div.append(button1);
    div.append(button2);
    td6.append(div);
    tr.append(td1);
    tr.append(td2);
    tr.append(td3);
    tr.append(td4);
    tr.append(td5);
    tr.append(td6);
    
    $('#tb_prescription table tbody').append(tr);
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
        console.log(isChecked, id_medical_test);
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
    console.log("addPrescriptionEdit", dataExamine.prescription);
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
        console.log("deleteFood", id_food, id_menu_time);
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
        console.log("rowspan", $('#menu_time_' + id_menu_time + ' td:first-child').attr("rowspan"));
        let rowspan = $('#menu_time_' + id_menu_time + ' td:first-child').attr("rowspan");
        
        $('#menu_time_' + id_menu_time + ' td:first-child').attr('rowspan', (rowspan - 1));
    } catch (error) {
        console.log("deleteFood error", error);
    }
}

function caculateFoodInfo(food, weight){
    try {
        if(food && weight > 0){
            food.energy = Math.round((food.energy * weight) / food.weight);
            food.protein = Math.round((food.protein * weight) / food.weight);
            food.animal_protein = Math.round((food.animal_protein * weight) / food.weight);
            food.lipid = Math.round((food.lipid * weight) / food.weight);
            food.unanimal_lipid = Math.round((food.unanimal_lipid * weight) / food.weight);
            food.carbohydrate = Math.round((food.carbohydrate * weight) / food.weight);
            food.weight = weight
        }
    } catch (error) {
        
    }
}

function changeWeightFood(id_food, menuTime_id, value){
    try {
        console.log("changeWeightFood", id_food, menuTime_id, value);
        let menu_id = parseInt($('#menu_id').val());
        for(let menu of dataExamine.menuExamine){
            if(menu_id == menu.id){
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
                                console.log("caculateFoodInfo", {...food});
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        }
    } catch (error) {
        
    }
}

function changeCourse(menuTime_id){
    try {
        let name_course = $('#menu_time_' + menuTime_id).find("input").val();
        console.log("changeCourse", name_course);
        let menu_id = parseInt($('#menu_id').val());
        for(let menu of dataExamine.menuExamine){
            if(menu_id == menu.id){
                for(let item of menu.detail){
                    if(menuTime_id == item.id){
                        item.name_course = name_course;
                        break;
                    }
                }
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
        let menu_id_last;
        for(let [i, item] of dataExamine.menuExamine.entries()){
            let newOption = new Option(item.name, item.id, false, false);
            menu_id_last = item.id;
            if(i == (dataExamine.menuExamine.length - 1)){
                $('#menu_id').append(newOption).trigger('change');
            }else{
                $('#menu_id').append(newOption);
            }
        }
        let menu_id = parseInt($('#menu_id').val() ? $('#menu_id').val() : 0);
        console.log("generateMenuExamine", dataExamine.menuExamine);
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
        detail: []
    }
    for(let time of dataExamine.listMenuTime){
        console.log("listMenuTime", time);
        menu.detail.push({
            "id": time.id, 
            "name": time.name,
            "name_course":'',
            "listFood":[]
        });
    }
    console.log("addMenuList",menu);
    return menu;
}

function generateTableMenu(menu_id){
    try {
        console.log("generateTableMenu", $("#menu_id").val());
        // let menu_id = parseInt($("#menu_id").val());
        if(menu_id){
            if(dataExamine.menuExamine.length > 0){
                for(let menu of dataExamine.menuExamine){
                    console.log("generateTableMenu",menu_id, menu.id);
                    if(menu.id == menu_id){
                        $('#name_menu').val(menu.name);
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
        console.log("addTemplateListMenuTime", listMenuTime);
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
        let menuNew = addMenuList();
        dataExamine.menuExamine.push(menuNew);
        let newOption = new Option(menuNew.name, menuNew.id, false, false);
        $('#menu_id').append(newOption).trigger('change');
        generateTableMenu(menuNew.id);
        $('#tb_menu').show();
    } catch (error) {
        
    }
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
                if(menu.id = menu_example_id){
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
                console.log("addFoodToMenu 1", menu_id);
                if(menu_id == item.id){
                    console.log("menu data", item);
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
                                    console.log("addFoodToMenu", dataExamine.menuExamine);
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
        }
    } catch (error) {
        
    }
}

function addTemplateMenuTime(menuTime){
    try {
        let rowspan = menuTime.listFood.length + 1;
        return menuTimeTemplate = $('<tr/>')
            .attr("id", "menu_time_"+ menuTime.id)
            .addClass("text-center")
            .append($("<td/>")
                .css({"writing-mode": "vertical-rl"})
                .attr("rowspan", rowspan)
                .text(menuTime.name)
            )
            .append($("<td/>")
                .append($("<input/>")
                    .attr({"type":"text", "value": menuTime.name_course})
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
        return foodTemplate = $('<tr/>')
        .attr("id", "food_"+ menuTime_id + "_" + food.id)
        .append($("<td/>")
            .text(food.name)
        )
        .append($("<td/>")
            .attr("id", "food_"+ menuTime_id + "_" + food.id + "_weight")
            .append($("<input/>")
                .attr({"type":"number", "value": food.weight})
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
            .append($(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                        <path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/>
                    </svg>`))
            .css({"cursor": "pointer"})
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
      console.log("importExcelFile");
      $('#file_input_excel').trigger('click');
    } catch (error) {
      console.log("importExcelFile", error);
    }
}

function getFileExcel(){
    try {
        let dataFile = $('#file_input_excel').prop('files');
        readXlsxFile(dataFile[0]).then(function(rows) {
            console.log("getFileExcel data", rows);
        });
    } catch (error) {
      console.log("getFileExcel", error);
    }
}

function setTotalMenu(listFood){
    try {
        console.log("setTotalMenu", listFood);
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
            $('#total_protein').text(String(parseFloat(total_protein).toFixed(2)));
            $('#total_animal_protein').text(String(parseFloat(total_animal_protein).toFixed(2)));
            $('#total_lipid').text(String(parseFloat(total_lipid).toFixed(2)));
            $('#total_unanimal_lipid').text(String(parseFloat(total_unanimal_lipid).toFixed(2)));
            $('#total_carbohydrate').text(String(parseFloat(total_carbohydrate).toFixed(2)));
        }
    } catch (error) {
        
    }
}

function saveMenu(isCreate){
    try {
        let loading         = $("#loading-page");
        let url = '/examine/save-menu';
        let menu_id = parseInt($('#menu_id').val());
        console.log("menu_id", menu_id);
        let data = {isCreate: isCreate, name: $("#name_menu").val()};
        for(let menu of dataExamine.menuExamine){
            console.log("menu", menu.id);
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
        console.log("data menu", data);
        $.ajax({
            type: 'POST',
            url: url,
            data: data,
            beforeSend: function() {
                loading.show();
            },
            success: function(result) {
                loading.hide();
                console.log("result", result);
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
        console.log("viewDetailExamine", id);
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
                    console.log("result", result);
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
        console.log("generateTableMenuSearch", id);
    } catch (error) {
        
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
        console.log("evt", evt.params.data.id);
        $("tbody tr").remove();
        generateTableMenu(evt.params.data.id);
    }).on('select2:unselect', function(e){
        console.log("menu_id unselect", e);
    });

    $("#diagnostic_id").on('select2:select', function(evt) {
        if(dataExamine.diagnostic.length > 0){
            for(let item of dataExamine.diagnostic){
                if(evt.params.data.id == item.id){      
                    $("#clinical_examination").text(item.detail);
                    break;
                }
            }
        }
    });
});

