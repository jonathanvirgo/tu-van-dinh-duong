//this method is used to show an element by removing the appropriate hiding class
//we don't use the jquery show/hide methods since they don't work with "display: flex" properly
$.fn.showElement = function () {
  this.removeClass('d-none');
}

//this method is used to hide an element by adding the appropriate hiding class
//we don't use the jquery show/hide methods since they don't work with "display: flex" properly
$.fn.hideElement = function () {
  this.addClass('d-none');
}

function setLocation(url) {
    window.location.href = url;
}

function OpenWindow(query, w, h, scroll) {
    var l = (screen.width - w) / 2;
    var t = (screen.height - h) / 2;

    winprops = 'resizable=1, height=' + h + ',width=' + w + ',top=' + t + ',left=' + l + 'w';
    if (scroll) winprops += ',scrollbars=1';
    var f = window.open(query, "_blank", winprops);
}

function showThrobber(message) {
    $('.throbber-header').html(message);
    window.setTimeout(function () {
        $(".throbber").show();
    }, 1000);
}

$(document).ready(function () {
    $('.multi-store-override-option').each(function (k, v) {
        checkOverriddenStoreValue(v, $(v).attr('data-for-input-selector'));
    });

    //we must intercept all events of pressing the Enter button in the search bar to be sure that the input focus remains in the context of the search
    $("div.card-search").keypress(function (event) {
        if (event.which == 13 || event.keyCode == 13) {
            $("button.btn-search").click();
            return false;
        }
    });

    //pressing Enter in the tablex should not lead to any action
    $("div[id$='-grid']").keypress(function (event) {
        if (event.which == 13 || event.keyCode == 13) {
            return false;
        }
    });
});

function checkAllOverriddenStoreValue(item) {
    $('.multi-store-override-option').each(function (k, v) {
        $(v).attr('checked', item.checked);
        checkOverriddenStoreValue(v, $(v).attr('data-for-input-selector'));
    });
}

function checkOverriddenStoreValue(obj, selector) {
    var elementsArray = selector.split(",");

    // first toggle appropriate hidden inputs for checkboxes
    if ($(selector).is(':checkbox')) {
        var name = $(selector).attr('name');
        $('input:hidden[name="' + name + '"]').attr('disabled', !$(obj).is(':checked'));
    }

    if (!$(obj).is(':checked')) {
        $(selector).attr('disabled', true);
        //Kendo UI elements are enabled/disabled some other way
        $.each(elementsArray, function (key, value) {
            var kenoduiElement = $(value).data("kendoNumericTextBox") || $(value).data("kendoMultiSelect");
            if (kenoduiElement !== undefined && kenoduiElement !== null) {
                kenoduiElement.enable(false);
            }
        });
    }
    else {
        $(selector).removeAttr('disabled');
        //Kendo UI elements are enabled/disabled some other way
        $.each(elementsArray, function (key, value) {
            var kenoduiElement = $(value).data("kendoNumericTextBox") || $(value).data("kendoMultiSelect");
            if (kenoduiElement !== undefined && kenoduiElement !== null) {
                kenoduiElement.enable();
            }
        });
    }
}

function bindBootstrapTabSelectEvent(tabsId, inputId) {
    $('#' + tabsId + ' > div ul li a[data-toggle="pill"]').on('shown.bs.tab', function (e) {
        var tabName = $(e.target).attr("data-tab-name");
        $("#" + inputId).val(tabName);
    });
}

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
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

function displayMessage(message) {
    if(message != ''){
        toastr.success(message, 'Thông báo');
    }
} 

function displayError(message) {
  toastr.clear();
  if(message != ''){
    toastr.error(message, 'Lỗi');
  }
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

function warningValidation(validationUrl, warningElementName, passedParameters) {
    addAntiForgeryToken(passedParameters);
    var element = $('[data-valmsg-for="' + warningElementName + '"]');

    var messageElement = element.siblings('.field-validation-custom');
    if (messageElement.length == 0) {
        messageElement = $(document.createElement("span"));
        messageElement.addClass('field-validation-custom');
        element.after(messageElement);
    }

    $.ajax({
        cache: false,
        url: validationUrl,
        type: "POST",
        dataType: "json",
        data: passedParameters,
        success: function (data, textStatus, jqXHR) {
            if (data.Result) {
                messageElement.addClass("warning");
                messageElement.html(data.Result);
            } else {
                messageElement.removeClass("warning");
                messageElement.html('');
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            messageElement.removeClass("warning");
            messageElement.html('');
        }
    });
};

function toggleNestedSetting(parentSettingName, parentFormGroupId) {
    if ($('input[name="' + parentSettingName + '"]').is(':checked')) {
        $('#' + parentFormGroupId).addClass('opened');
    } else {
        $('#' + parentFormGroupId).removeClass('opened');
    }
}

function parentSettingClick(e) {
    toggleNestedSetting(e.data.parentSettingName, e.data.parentFormGroupId);
}

function initNestedSetting(parentSettingName, parentSettingId, nestedSettingId) {
    var parentFormGroup = $('input[name="' + parentSettingName +'"]').closest('.form-group');
    var parentFormGroupId = $(parentFormGroup).attr('id');
    if (!parentFormGroupId) {
        parentFormGroupId = parentSettingId;
    }
    $(parentFormGroup).addClass('parent-setting').attr('id', parentFormGroupId);
    if ($('#' + nestedSettingId + ' .form-group').length == $('#' + nestedSettingId + ' .form-group.advanced-setting').length) {
        $('#' + parentFormGroupId).addClass('parent-setting-advanced');
    }

    //$(document).on('click', 'input[name="' + parentSettingName + '"]', toggleNestedSetting(parentSettingName, parentFormGroupId));
    $('input[name="' + parentSettingName + '"]').click(
        { parentSettingName: parentSettingName, parentFormGroupId: parentFormGroupId }, parentSettingClick);
    toggleNestedSetting(parentSettingName, parentFormGroupId);
}
//no-tabs solution
$(document).ready(function () {
  $(".card.card-secondary >.card-header").click(CardToggle);

  //expanded
  $('.card.card-secondary').on('expanded.lte.cardwidget', function () {
    WrapAndSaveBlockData($(this), false)
    
    if ($(this).find('table.dataTable').length > 0) {
      setTimeout(function () {
        ensureDataTablesRendered();
      }, 420);
    }
  });

  //collapsed
  $('.card.card-secondary').on('collapsed.lte.cardwidget', function () {
    WrapAndSaveBlockData($(this), true)
  });
});

function CardToggle() {
  var card = $(this).parent(".card.card-secondary");
  card.CardWidget('toggle'); 
}

//collapse search block
$(document).ready(function () {
  $(".row.search-row").click(ToggleSearchBlockAndSavePreferences);
});

function ToggleSearchBlockAndSavePreferences() {
    $(this).parents(".card-search").find(".search-body").slideToggle();
    var icon = $(this).find(".icon-collapse i");
    if ($(this).hasClass("opened")) {
      icon.removeClass("fa-angle-up");
      icon.addClass("fa-angle-down");
    } else {
      icon.addClass("fa-angle-up");
      icon.removeClass("fa-angle-down");
    }

    $(this).toggleClass("opened");
}
function ensureDataTablesRendered() {
  $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
}

function reloadAllDataTables(itemCount) {
  //depending on the number of elements, the time for animation of opening the menu should increase
  var timePause = 300;
  if (itemCount) {
    timePause = itemCount * 100;
  }
  $('table[class^="table"]').each(function () {
    setTimeout(function () {
      ensureDataTablesRendered();
    }, timePause);
  });
}

//scrolling and hidden DataTables issue workaround
//More info - https://datatables.net/examples/api/tabs_and_scrolling.html
$(document).ready(function () {
  $('button[data-card-widget="collapse"]').on('click', function (e) {
    //hack with waiting animation. 
    //when page is loaded, a box that should be collapsed have style 'display: none;'.that's why a table is not updated
    setTimeout(function () {
      ensureDataTablesRendered();
    }, 1);
  });

  // when tab item click
  $('.nav-tabs .nav-item').on('click', function (e) {
    setTimeout(function () {
      ensureDataTablesRendered();
    }, 1);
  });

  $('ul li a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    ensureDataTablesRendered();
  });

  $('#advanced-settings-mode').on('click', function (e) {
    ensureDataTablesRendered();
  });

  //when sidebar-toggle click
  $('#nopSideBarPusher').on('click', function (e) {
    reloadAllDataTables();
  });

  $('textarea').each(function () {
    this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
  }).on('input', function () {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
  });
});

//scroll to top
(function ($) {
    $.fn.backTop = function () {
        var backBtn  = this;
        var position = 1000;
        var speed    = 900;

        $(document).scroll(function () {
            var pos = $(window).scrollTop();
            if (pos >= position) {
              backBtn.fadeIn(speed);
            } else {
              backBtn.fadeOut(speed);
            }
        });

        backBtn.click(function () {
          $("html, body").animate({ scrollTop: 0 }, 900);
        });
    }
}(jQuery));


$(document).ajaxStart(function () {
    $('#ajaxBusy').show();
}).ajaxStop(function () {
    $('#ajaxBusy').hide();
});

function renderBookingStatusHtml(status){
  var str_name ='';
  switch(status) {
  case -2:
    str_name = 'Nháp';
    break;
  case -1:
    str_name = 'Huỷ';
    break;
  case 0:
    str_name = 'Giữ chỗ';
    break;
  case 1:
    str_name = 'Chờ duyệt';
    break;
  case 2:
    str_name = 'Đã duyệt';
    break;
  default:
    str_name = 'None';
  }
  return str_name;
}

function renderArticleStatusHtml(status){
  var str_name ='';
  switch(status) {
  case -2:
    str_name = 'Nháp';
    break;
  case -1:
    str_name = 'Huỷ';
    break;
  case 0:
    str_name = 'Giữ chỗ';
    break;
  case 1:
    str_name = 'Chờ duyệt';
    break;
  case 2:
    str_name = 'Đã duyệt';
    break;
  default:
    str_name = 'None';
  }
  return str_name;
}

// function syncChannelPRBooking(){
//   var loading = $("#loading-page");
//   $.ajax({
//     url: '/admin/getAllChannelToolPR',
//     type: 'GET',
//     dataType: 'JSON',
//     beforeSend: function () {
//       loading.show();
//     },
//     success: function (result) {
//       loading.hide();
//       if(!result.status) {
//         displayError(result.message);
//       } else {
//         displayMessage(result.message);
//         window.setTimeout(function() { 
//           window.location.reload();
//         }, 1000);
//       }
//     },
//     error: function(jqXHR, exception){
//       loading.hide();
//       ajax_call_error(jqXHR, exception);
//     }
//   });
// }

// function syncWebsitePRBooking(){
//   var loading = $("#loading-page");
//   $.ajax({
//     url: '/admin/getAllWebsiteToolPR',
//     type: 'GET',
//     dataType: 'JSON',
//     beforeSend: function () {
//       loading.show();
//     },
//     success: function (result) {
//       loading.hide();
//       if(!result.status) {
//         displayError(result.message);
//       } else {
//         displayMessage(result.message);
//         window.setTimeout(function() { 
//           window.location.reload();
//         }, 1000);
//       }
//     },
//     error: function(jqXHR, exception){
//       loading.hide();
//       ajax_call_error(jqXHR, exception);
//     }
//   });
// }

// function syncFormatPRBooking(){
//   var loading = $("#loading-page");
//   $.ajax({
//     url: '/admin/getAllFormatToolPR',
//     type: 'GET',
//     dataType: 'JSON',
//     beforeSend: function () {
//       loading.show();
//     },
//     success: function (result) {
//       loading.hide();
//       if(!result.status) {
//         displayError(result.message);
//       } else {
//         displayMessage(result.message);
//         window.setTimeout(function() { 
//           window.location.reload();
//         }, 1000);
//       }
//     },
//     error: function(jqXHR, exception){
//       loading.hide();
//       ajax_call_error(jqXHR, exception);
//     }
//   });
// }

function importFileExcel(id){
  try {
    $('#' + id).trigger('click');
  } catch (error) {
    console.log("importFoodInfo", error);
  }
}

// [
  // 0: "[ Food Name ]"
  // 1: "[Weight]"
  // 2: "02.Energy"
  // 3: "04.Protein"
  // 4: "4a.Animal Protein"
  // 5: "05.Lipid"
  // 6: "5b.Unanimal Lipid"
  // 7: "06.Carbohydrate"
  // 8: "07.Fiber"
  // 9: "08.Ash"
  // 10: "09.Retinol"
  // 11: "10.Caroten"
  // 12: "11.Vit.B1"
  // 13: "12.Vit.B2"
  // 14: "13.Vit.PP"
  // 15: "14.Vit.C"
  // 16: "15.Ca"
  // 17: "16.P"
  // 18: "17.Fe"
// ]

function getFileFoodInfo(){
  try {
    let dataFile = $('#file_input_food_info').prop('files');
    let dataFood = [];
    let dataRemove = [];
    let i = 0;
    readXlsxFile(dataFile[0]).then(function(rows) {
      for(let [index, item] of rows.entries()){
        // nếu có tên và khối lượng là thực phẩm 0-19
        if(typeof(item[0]) == "string"){
          if(item[1] && typeof(item[1]) == "number"){
            if((i - 1) >= 0) dataFood[(i-1)].detail.push(item);
          }else if(!item[1] && !item[2] && !item[3] && !item[4] && !item[5] && !item[6] && !item[7] && !item[8] && !item[9] && !item[10] && !item[11] && !item[12] && !item[13] && !item[14] && !item[15] && !item[16] && !item[17] && !item[18]){
            // nếu có tên và không có chỉ số là loại thực phẩm;
            dataFood.push({id: i++, name: item[0], detail: []});
          }else{
            // Dữ liệu lỗi;
            dataRemove.push(item);
          }
        }
      }
      var formData        = new FormData();
      formData.append("data", JSON.stringify(dataFood))
      $.ajax({
        type: 'POST',
        url: '/admin/food-info/import-from-excel',
        processData: false,
        contentType: false,
        data: formData,
        success: function(result) {
            if (result.success) {
                displayMessage('Lưu thành công');
                setTimeout(()=>{
                    window.location.href = "/admin/food-info"
                }, 500);
            } else {
                displayError(result.message);
            }
        }
    });
    })
  } catch (error) {
    console.log("getFileFoodInfo", error);
  }
}

function getFileWeightHeight(){
  try {
    let dataFile = $('#file_input_weight_height').prop('files');
    let dataWeightHeight = [];
    let i = 0;
    readXlsxFile(dataFile[0]).then(function(rows) {
      let type = 0;
      for(let [index, item] of rows.entries()){
        // nếu có tên và khối lượng là thực phẩm 0-19
        if(typeof(item[1]) == "number" && item[2] && item[3] && item[4] && item[5]){
          if(item[0] && item[0] == 'Tuổi'){
            type = 1;
          }
          dataWeightHeight.push({
            type_year_old: type,
            year_old: item[1],
            gender: 0,
            weight: item[4],
            height: item[5]
          }, {
            type_year_old: type,
            year_old: item[1],
            gender: 1,
            weight: item[2],
            height: item[3]
          });
        }
      }
      var formData        = new FormData();
      formData.append("data", JSON.stringify(dataWeightHeight))
      $.ajax({
        type: 'POST',
        url: '/admin/standard-weight-height/import-from-excel',
        processData: false,
        contentType: false,
        data: formData,
        success: function(result) {
            if (result.success) {
                displayMessage('Lưu thành công');
                setTimeout(()=>{
                    window.location.href = "/admin/standard-weight-height"
                }, 500);
            } else {
                displayError(result.message);
            }
        }
      });
    })
  } catch (error) {
    console.log("getFileStandardWeightHeight", error);
  }
}

function getFileHeightByWeight(){
  try {
    let dataFile = $('#file_input_height_by_weight').prop('files');
    let dataHeightByWeight = [];
    let i = 0;
    readXlsxFile(dataFile[0]).then(function(rows) {
      console.log('readXlsxFile', rows);

      for(let [index, item] of rows.entries()){
        //Nếu item 0 là số và có đủ 5 trường
        // 0 nữ 1 nam
        if(typeof(item[0]) == "number" && item[1] && item[2] && item[3] && item[4]){
          dataHeightByWeight.push({
            height: item[0],
            gender: 0,
            weight_min: item[3],
            weight_max: item[4]
          },
          {
            height: item[0],
            gender: 1,
            weight_min: item[1],
            weight_max: item[2]
          }
          );
        }
      }
      console.log('dataHeightByWeight', dataHeightByWeight);
      var formData        = new FormData();
      formData.append("data", JSON.stringify(dataHeightByWeight))
      $.ajax({
        type: 'POST',
        url: '/admin/height-by-weight/import-from-excel',
        processData: false,
        contentType: false,
        data: formData,
        success: function(result) {
            if (result.success) {
                displayMessage('Lưu thành công');
                setTimeout(()=>{
                    window.location.href = "/admin/height-by-weight"
                }, 500);
            } else {
                displayError(result.message);
            }
        }
      });
    })
  } catch (error) {
    console.log("getFileHeightByWeight", error);
  }
}

function getFileWeightByAge(){
  try {
    let dataFile = $('#file_input_weight').prop('files');
    let dataWeightByAge = [];
    let i = 0;
    readXlsxFile(dataFile[0]).then(function(rows) {
      console.log('readXlsxFile', rows);
      // return
      for(let [index, item] of rows.entries()){
        //Nếu item 0 là số và có đủ 5 trường
        // 0 nữ 1 nam
        if(item[0] && item[4] && item[5] && item[6] && item[7] && typeof(item[4]) == 'number'){
          let arrYear = typeof(item[0]) == 'number' ? (item[0] + '').split('.') : item[0].split(':');
          let year = isNaN(parseInt(arrYear[0])) ? 0 : parseInt(arrYear[0]);
          let month = isNaN(parseInt(arrYear[1])) ? 0 : parseInt(arrYear[1]);
          console.log('index: ' + index, year , month);
          let age = year * 12 + month;
          dataWeightByAge.push({
            age: age,
            gender: 1,
            weight_min: isNaN(parseFloat(item[2])) ? '' : parseFloat(item[2]).toFixed(1),
            weight_max: isNaN(parseFloat(item[3])) ? '' : parseFloat(item[3]).toFixed(1),
            height_min: isNaN(parseFloat(item[4])) ? '' : parseFloat(item[4]).toFixed(1),
            height_max: isNaN(parseFloat(item[5])) ? '' : parseFloat(item[5]).toFixed(1),
            bmi_min: isNaN(parseFloat(item[6])) ? '' : parseFloat(item[6]).toFixed(1),
            bmi_max: isNaN(parseFloat(item[7])) ? '' : parseFloat(item[7]).toFixed(1)
          });
        }
      }
      console.log('dataHeightByWeight', dataWeightByAge);
      var formData        = new FormData();
      formData.append("data", JSON.stringify(dataWeightByAge));
      // return;
      $.ajax({
        type: 'POST',
        url: '/admin/index-by-age/import-from-excel-weight',
        processData: false,
        contentType: false,
        data: formData,
        success: function(result) {
            if (result.success) {
                displayMessage('Lưu thành công');
                setTimeout(()=>{
                    window.location.href = "/admin/index-by-age"
                }, 500);
            } else {
                displayError(result.message);
            }
        }
      });
    })
  } catch (error) {
    console.log("getFileWeightByAge", error);
  }
}

function getFileHeightByAge(){
  try {
    let dataFile = $('#file_input_height').prop('files');
    let dataHeightByAge = [];
    let i = 0;
    readXlsxFile(dataFile[0]).then(function(rows) {
      console.log('readXlsxFile', rows);
      // return
      for(let [index, item] of rows.entries()){
        //Nếu item 0 là số và có đủ 5 trường
        // 0 nữ 1 nam
        if(typeof(item[0]) == "number" && item[1] && item[2] && item[3] && item[4]){
          dataHeightByAge.push({
            age: item[0],
            gender: 0,
            height_min: isNaN(parseFloat(item[3])) ? '' : parseFloat(item[3]).toFixed(1),
            height_max: isNaN(parseFloat(item[4])) ? '' : parseFloat(item[4]).toFixed(1)
          },
          {
            age: item[0],
            gender: 1,
            height_min: isNaN(parseFloat(item[1])) ? '' : parseFloat(item[1]).toFixed(1),
            height_max: isNaN(parseFloat(item[2])) ? '' : parseFloat(item[2]).toFixed(1),
          }
          );
        }
      }
      console.log('dataHeightByWeight', dataHeightByAge);
      var formData        = new FormData();
      formData.append("data", JSON.stringify(dataHeightByAge))
      $.ajax({
        type: 'POST',
        url: '/admin/index-by-age/import-from-excel-height',
        processData: false,
        contentType: false,
        data: formData,
        success: function(result) {
            if (result.success) {
                displayMessage('Lưu thành công');
                setTimeout(()=>{
                    window.location.href = "/admin/index-by-age"
                }, 500);
            } else {
                displayError(result.message);
            }
        }
      });
    })
  } catch (error) {
    console.log("getFileWeightByAge", error);
  }
}

function getFileBmiByAge(){
  try {
    let dataFile = $('#file_input_bmi').prop('files');
    let dataBmiByAge = [];
    let i = 0;
    readXlsxFile(dataFile[0]).then(function(rows) {
      console.log('readXlsxFile', rows);
      // return
      for(let [index, item] of rows.entries()){
        //Nếu item 1 là số và có đủ 5 trường
        // 0 nữ 1 nam
        if(typeof(item[1]) == "number" && item[2] && item[3] && item[4] && item[5]){
          dataBmiByAge.push({
            age: item[1],
            gender: 0,
            bmi_min: isNaN(parseFloat(item[4])) ? '' : parseFloat(item[4]).toFixed(1),
            bmi_max: isNaN(parseFloat(item[5])) ? '' : parseFloat(item[5]).toFixed(1)
          },
          {
            age: item[1],
            gender: 1,
            bmi_min: isNaN(parseFloat(item[2])) ? '' : parseFloat(item[2]).toFixed(1),
            bmi_max: isNaN(parseFloat(item[3])) ? '' : parseFloat(item[3]).toFixed(1),
          }
          );
        }
      }
      console.log('dataHeightByWeight', dataBmiByAge);
      var formData        = new FormData();
      formData.append("data", JSON.stringify(dataBmiByAge))
      $.ajax({
        type: 'POST',
        url: '/admin/index-by-age/import-from-excel-bmi',
        processData: false,
        contentType: false,
        data: formData,
        success: function(result) {
            if (result.success) {
                displayMessage('Lưu thành công');
                setTimeout(()=>{
                    window.location.href = "/admin/index-by-age"
                }, 500);
            } else {
                displayError(result.message);
            }
        }
      });
    })
  } catch (error) {
    console.log("getFileBmiByAge", error);
  }
}