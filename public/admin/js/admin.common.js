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
        toastr.success(message, 'Th??ng b??o');
    }
} 

function displayError(message) {
  toastr.clear();
  if(message != ''){
    toastr.error(message, 'L???i');
  }
}

function ajax_call_error(jqXHR, exception){
    var msg = '';
    if (jqXHR.status === 0) {
        msg = 'M???t k???t n???i m???ng. Vui l??ng ki???m tra k???t n???i v?? th??? l???i.';
    } else if (jqXHR.status == 404) {
        msg = 'Kh??ng t??m th???y trang ???????c y??u c???u. [404]';
    } else if (jqXHR.status == 500) {
        msg = 'L???i m??y ch??? n???i b??? [500].';
    } else if (exception === 'parsererror') {
        msg = 'Ph??n t??ch c?? ph??p JSON kh??ng th??nh c??ng.';
    } else if (exception === 'timeout') {
        msg = 'L???i h???t th???i gian.';
    } else if (exception === 'abort') {
        msg = 'Y??u c???u Ajax ???? b??? h???y b???.';
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
    str_name = 'Nh??p';
    break;
  case -1:
    str_name = 'Hu???';
    break;
  case 0:
    str_name = 'Gi??? ch???';
    break;
  case 1:
    str_name = 'Ch??? duy???t';
    break;
  case 2:
    str_name = '???? duy???t';
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
    str_name = 'Nh??p';
    break;
  case -1:
    str_name = 'Hu???';
    break;
  case 0:
    str_name = 'Gi??? ch???';
    break;
  case 1:
    str_name = 'Ch??? duy???t';
    break;
  case 2:
    str_name = '???? duy???t';
    break;
  default:
    str_name = 'None';
  }
  return str_name;
}

function syncChannelPRBooking(){
  var loading = $("#loading-page");
  $.ajax({
    url: '/admin/getAllChannelToolPR',
    type: 'GET',
    dataType: 'JSON',
    beforeSend: function () {
      loading.show();
    },
    success: function (result) {
      loading.hide();
      if(!result.status) {
        displayError(result.message);
      } else {
        displayMessage(result.message);
        window.setTimeout(function() { 
          window.location.reload();
        }, 1000);
      }
    },
    error: function(jqXHR, exception){
      loading.hide();
      ajax_call_error(jqXHR, exception);
    }
  });
}

function syncWebsitePRBooking(){
  var loading = $("#loading-page");
  $.ajax({
    url: '/admin/getAllWebsiteToolPR',
    type: 'GET',
    dataType: 'JSON',
    beforeSend: function () {
      loading.show();
    },
    success: function (result) {
      loading.hide();
      if(!result.status) {
        displayError(result.message);
      } else {
        displayMessage(result.message);
        window.setTimeout(function() { 
          window.location.reload();
        }, 1000);
      }
    },
    error: function(jqXHR, exception){
      loading.hide();
      ajax_call_error(jqXHR, exception);
    }
  });
}

function syncFormatPRBooking(){
  var loading = $("#loading-page");
  $.ajax({
    url: '/admin/getAllFormatToolPR',
    type: 'GET',
    dataType: 'JSON',
    beforeSend: function () {
      loading.show();
    },
    success: function (result) {
      loading.hide();
      if(!result.status) {
        displayError(result.message);
      } else {
        displayMessage(result.message);
        window.setTimeout(function() { 
          window.location.reload();
        }, 1000);
      }
    },
    error: function(jqXHR, exception){
      loading.hide();
      ajax_call_error(jqXHR, exception);
    }
  });
}

function importFoodInfo(){
  try {
    console.log("importFoodInfo");
    $('#file_input_food_info').trigger('click');
  } catch (error) {
    console.log("importFoodInfo", error);
  }
}

function getFileFoodInfo(){
  try {
    let dataFile = $('#file_input_food_info').prop('files');
    console.log("getFileFoodInfo", dataFile);
    readXlsxFile(dataFile[0]).then(function(rows) {
      console.log("readXlsxFile", rows);
      // `rows` is an array of rows
      // each row being an array of cells.
    })
  } catch (error) {
    console.log("getFileFoodInfo", error);
  }
}