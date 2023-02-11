let dataArticle = {
    type: 1,
    indexFile: 0,
    isSave: true,
    page: 'create',
    status: -2,
    dataApprove: '',
    search_status: '',
    versionContent: 0,
    article: null,
    requestEdit: null,
    checkCreateRequest: false,
    allowEdit: null,
    totalRequestCancel: 0,
    totalRequestEdit: 0,
    site_name: '',
    id_request: '',
    book_id: null,
    isLockPublish: false,
    overQuota: false
};
const dt_content = new DataTransfer();
const dt_asd     = new DataTransfer();
let fileInfos    = [];
let fileDeletes  = [];

window.addEventListener("message", (event) => {
    if (event.data && event.data.act && (event.data.act == 'save' || event.data.act == 'canceledit') && dataArticle.page == 'create') {
        $("button[name='btn-editor']").prop('disabled', false);
        saveArticle('editor', 0, 1);
    }
    if(event.data && event.data.act == 'save'){
        dataArticle.versionContent += 1;
    }
    if(event.data && event.data.act == 'canceledit'){
        returnList();
    }
    // if (dataArticle.page == 'publish') {
    //     showEditor(0);
    // }
    if(event.data && event.data.act == 'loaddone'){
        $("#loading_editor").hide();
    }
}, false);

function validateForm(prefix) {
    if (dataArticle.search_status == -2 && (!$("#" + prefix + "_site_id").val() || ($("#" + prefix + "_site_id").val() && $("#" + prefix + "_site_id").val() == 0))) {
        return false;
    }
    if (!$("#" + prefix + "_format_id").val() || ($("#" + prefix + "_format_id").val() && $("#" + prefix + "_format_id").val() == 0)) {
        return false;
    }
    if (!$("#" + prefix + "_post_type").val()) {
        return false;
    }
    if ([-2,5].includes(dataArticle.search_status) && (!$("#" + prefix + "_title").val() || ($("#" + prefix + "_title").val() && $("#" + prefix + "_title").val().trim().length == 0))) {
        return false;
    }
    if (!$("#" + prefix + "_description").val() || ($("#" + prefix + "_description").val() && $("#" + prefix + "_description").val().trim().length == 0)) {
        return false;
    }
    if (prefix == 'art' && [-2,5].includes(dataArticle.search_status)) {
        let fileContent = fileInfos.filter(s => s.type == 2);
        if (fileContent.length == 0) {
            return false;
        }
    }

    return true;
}

function getUploadInput(type) {
    switch(type){
        case 1:$("#file_input_content").trigger('click');
            break;
        case 2: 
            if(dataArticle.type == 1){
                $("#file_input_asd_review").trigger('click');
            }else if(dataArticle.type == 2){
                $("#file_input_asd").trigger('click');
            }
            break;
        default: break;
    } 
}

function getEditorToken(target, book_id) {
    let loading   = $("#loading_editor");
    $.ajax({
        type: 'GET',
        url: '/article/get-editor-token/' + book_id,
        beforeSend: function() {
            loading.show();
            var current_progress = 0;
            var interval = setInterval(function() {
                current_progress += 0.5;
                $("#loading_editor").find('.loading-current').text(Math.round(current_progress) + ' %');
                $("#loading_editor").find('div[role="progressbar"]').attr("aria-valuenow", Math.round(current_progress));
                $("#loading_editor").find('.progress-bar').css("width", Math.round(current_progress) + "%");

                if (current_progress >= 96){
                    clearInterval(interval);
                }
            }, 100);
        },
        success: function(result) {
            $(target).attr("src", decodeURIComponent(result.linkEditor));
        },
        error: function(jqXHR, exception) {
            loading.hide();
            ajax_call_error(jqXHR, exception);
        }
    });
}

function changeTypeArticle(type) {
    dataArticle.type = type;
    // if(type == 1){
        // getEditorToken('#frame_editor', dataArticle.book_id);
    // }else{
        // $('#frame_editor').attr("src", 'https://apidangtin.admicro.vn/Signout.aspx');
    // }
}

//type = 1 Giấy phép quảng cáo; 
//type = 2 Nội dung bài viết;
function initHtmlFile(listFile, type, errorMessage) {
    let files, totalFiles;
    let arrFileUpload = [];
    if (listFile) {
        files = listFile;
        totalFiles = listFile.length;
        for (let i = 0; i < totalFiles; i++) {
            arrFileUpload.push(files[i]);
            let file_local = {
                id: i + dataArticle.indexFile,
                name: files[i].name,
                version: 1,
                created_at: new Date().toLocaleDateString('pt-PT'),
                type: type,
                isNew: true,
                path: "",
                path_cloud: "",
                size: files[i].size,
                idServer: ''
            };
            fileInfos.push(file_local);
            //Hiển thị danh sách file
            toogleDropFileSelect();
            addFileHtml2(file_local, false);
            // let a = addFileHtml(file_local, 1);
            //type = 1 Giấy phép quảng cáo; 
            //type = 2 Nội dung bài viết;
            // if (type == 1) {
            //     $('#tb_ads_license').append(a);
            //     $('#file-ads').removeClass('btn-primary');
            //     $('#file-ads').addClass('btn-primary-light');
            // } else if (type == 2) {
            //     $('#tb_list_content').append(a);
            //     $('#file-content').removeClass('btn-primary');
            //     $('#file-content').addClass('btn-primary-light');
            // }
            if (i == totalFiles - 1) {
                dataArticle.indexFile = file_local.id + 1;
            } else {
                dataArticle.indexFile = file_local.id;
            }

            // $('#tb_list_content').css('height', 'auto');
            // $('#tb_ads_license').css('height', 'auto');
            // var hcontent = $('#tb_list_content').height();
            // var hads     = $('#tb_ads_license').height();
            // if(hcontent > hads){
            //     $('#tb_ads_license').css('height', hcontent + 6 + 'px');
            // }else{
            //     $('#tb_list_content').css('height', hads + 6 + 'px');
            // }
        }
        if(errorMessage.length > 0) displayError( errorMessage);
        if(arrFileUpload.length > 0){
            if(dataArticle.status == -2) uploadFile(type, arrFileUpload);
        }
    }
}

function addFileHtml(file, oldFile) {
    let div = document.createElement("div");
    let td1 = document.createElement("div");
    let td2 = document.createElement("div");
    // let td3 = document.createElement("div");
    let td4 = document.createElement("div");
    // div 1
    let a = document.createElement("a");
    let linkFile = '';
    if (file.path_cloud) {
        linkFile = file.path_cloud;
    }else{
        linkFile = file.path;
    }
    
    $(a).attr('href', linkFile);
    $(a).attr('target', '_blank');
    $(a).text(file.name);
    if(oldFile == 2){
        $(td1).text(file.name);
    }else{
        $(td1).append(a);
    }
    // div 2
    $(td2).text(file.created_at);

    // div 3
    $(td3).text(file.version);

    //div 4
    if(dataArticle.search_status == -2 || dataArticle.search_status == 5){
        let svg   = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        let path2 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        svg.setAttribute("fill", "none");
        svg.setAttribute('viewbox', '0 0 24 24');
        svg.setAttribute('width', '24px');
        svg.setAttribute('height', '24px');
    
        path1.setAttribute('d', 'M18 6L6 18');
        path1.setAttribute('stroke', '#BDBDBD');
        path1.setAttribute('stroke-width', '2');
        path1.setAttribute('stroke-linecap', 'round');
        path1.setAttribute('stroke-linejoin', 'round');
    
        path2.setAttribute('d', 'M6 6L18 18');
        path2.setAttribute('stroke', '#BDBDBD');
        path2.setAttribute('stroke-width', '2');
        path2.setAttribute('stroke-linecap', 'round');
        path2.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(path1);
        svg.appendChild(path2);
    
        svg.dataset.id = file.id;
    
        $(svg).click(function() {
            let id = $(this).data('id');
            showConfirmDeleteFile(id)
        });
        td4.append(svg);
    }

    div.append(td1);
    div.append(td2);
    // div.append(td3);
    div.append(td4);

    let id;
    if (oldFile == 0) {
        id = 'f_old_' + file.id;
    } else {
        id = 'f_new_' + file.id;
    }
    $(div).attr('id', id);

    $(td1).addClass("name-file");
    $(td2).addClass("date-file");
    $(div).addClass("file-wapper");
    $(td4).addClass("btn-file");
    return div;
}

function addFileHtml2(file, isEdit){
    try {
        // oldFile 1: Edit 0: Add
        let linkFile = file.path_cloud ? file.path_cloud : (file.path ? file.path : '');
        
        let li = $("<li>", {"class": "upload-list-item", "id": "file_" + file.id});
        
        let svgFileIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        let svgFileIconUse = document.createElementNS("http://www.w3.org/2000/svg", 'use');
        svgFileIcon.setAttribute( "class", "iconsvg-file upload-list-icon me-1");
        svgFileIconUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/public/content/images/sprite.svg#file");
        svgFileIcon.append(svgFileIconUse);
        
        let nameFile = $("<a>", {"href": linkFile, "target":'_blank'});
        nameFile.text(file.name);
        li.append(svgFileIcon);
        li.append(nameFile);
        if(isEdit && ![-2,-1,5].includes(dataArticle.search_status)){
            if(file.type == 1){
                if(dataArticle.type == 1){
                    $("#list_ads_license_review").find(".tb_ads_license_old").append(li);
                }else if(dataArticle.type == 2){
                    $("#list_ads_license").find(".tb_ads_license_old").append(li);
                }
            }else if(file.type == 2){
                $("#tb_list_content_old").append(li);
            }
        }else{
            if(dataArticle.search_status !== -1){
                let btnClose = $("<button>", {"class": "btn btn-link upload-list-close p-0 min-h-auto ms-2", "type":"button"});
                btnClose.data("id", file.id);
                btnClose.click(function() {
                    let id = $(this).data('id');
                    showConfirmDeleteFile(id);
                });
                let svgDeleteIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                let svgDeleteIconUse = document.createElementNS("http://www.w3.org/2000/svg", 'use');
                svgDeleteIcon.setAttribute( "class", "iconsvg-close");
                svgDeleteIconUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/public/content/images/sprite.svg#close");
                svgDeleteIcon.append(svgDeleteIconUse);
                btnClose.append(svgDeleteIcon);
                li.append(btnClose);
            }else{
                $("#tb_list_content ~ hr").hide();
            }
            if(file.type == 1){
                if(dataArticle.type == 1){
                    $("#list_ads_license_review").find(".tb_ads_license").append(li);
                }else if(dataArticle.type == 2){
                    $("#list_ads_license").find(".tb_ads_license").append(li);
                }
            }else if(file.type == 2){
                $("#tb_list_content").append(li);
            }
        }
    } catch (error) {
        console.log("addFileHtml2", error);
    }
}

function dropFileUpload() {
    $('.upload').on(
        'dragover',
        function(e) {
            e.preventDefault();
            e.stopPropagation();
        }
    )
    $('.upload').on(
        'dragenter',
        function(e) {
            e.preventDefault();
            e.stopPropagation();
        }
    )
    $('.upload').on(
        'drop',
        function(e) {
            let type_input_file;
            if (e.currentTarget.id == "list_content") {
                type_input_file = 2;
            } else if (e.currentTarget.id == "list_ads_license") {
                type_input_file = 1;
            }else if (e.currentTarget.id == "list_ads_license_review"){
                type_input_file = 1;
            }

            if (e.originalEvent.dataTransfer) {
                if (e.originalEvent.dataTransfer.files.length) {
                    e.preventDefault();
                    e.stopPropagation();
                    /*UPLOAD FILES HERE*/
                    let files = e.originalEvent.dataTransfer.files;
                    let getFile = addFiletoDataTranfer(files, type_input_file);
                    initHtmlFile(getFile.arrFileUpload, type_input_file, getFile.nameFileErr);
                    if (type_input_file == 1) {
                        if(e.currentTarget.id == "list_ads_license_review"){
                            document.getElementById('file_input_asd_review').files = dt_asd.files;
                        }else{
                            document.getElementById('file_input_asd').files = dt_asd.files;
                        }
                    } else if (type_input_file == 2) {
                        document.getElementById('file_input_content').files = dt_content.files;
                    }
                }
            }
        }
    );
}

function showConfirmDeleteFile(index) {
    $('#modal-delete').modal('show');
    $('#file-id').val(index);
}

function showConfirmCancelArticle(id_book, id_request, search_status, booking_id_pr, book_status) {
    var modal_title = "booking";

    if([-2,1,5].includes(search_status)){
        modal_title = "bài viết";
    }
    var confirmBox = `
    <div class="modal fade" id="modal_cf_cancel_article" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <button class="modal-btn-close btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
          <div class="text-center mb-2">
            <svg class="iconsvg-trash-lg text-tra-lai fs-65px">
              <use xlink:href="/public/content/images/sprite.svg#trash-lg"></use>
            </svg>
          </div>
          <h4 class="modal-title text-center text-tra-lai mb-4">Huỷ `+ modal_title +`</h4>
          <p class="text-body-2 fw-5 text-center mb-4">Bạn muốn hủy `+ modal_title +` này không?</p>
          <div class="row g-2 justify-content-center">
            <div class="col-6">
              <button class="btn btn-cancel box-btn w-100 text-uppercase" type="button" data-bs-dismiss="modal">Không</button>
            </div>
            <div class="col-6">
              <button onclick="cancelArticle(`+ id_book +`,'`+ id_request +`',`+ search_status +`)" class="btn btn-primary box-btn w-100 text-uppercase" type="button" data-bs-dismiss="modal">
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
  $("#modal_cf_cancel_article").modal('show');
}

function showConfirmRequestCancel(id_book, id_request, status, total_request_cancel) {
    var confirmBox = `
        <div class="modal fade" id="modal_request_cancel" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <button class="modal-btn-close btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
                    <h4 class="modal-title text-center mb-4">Bạn có muốn yêu cầu hủy booking cho bài viết này không?</h4>
                    <textarea id="reason_cancel" class="form-control mb-4" rows="10" placeholder="Nhập lý do huỷ bài viết (*)" aria-label="Nhập lý do huỷ bài viết"></textarea>
                    <div class="row g-2 justify-content-center">
                      <div class="col-6">
                        <button class="btn btn-cancel box-btn w-100 text-uppercase" type="button" data-bs-dismiss="modal">Không</button>
                      </div>
                      <div class="col-6">
                        <button class="btn btn-primary box-btn w-100 text-uppercase" type="button" onclick="requestCancel(`+ id_book +`,'`+ id_request +`',`+ status +`,`+ total_request_cancel +`)">
                          <svg class="iconsvg-send-2 flex-shrink-0 fs-16px me-2">
                            <use xlink:href="/public/content/images/sprite.svg#send-2"></use>
                          </svg>Gửi yêu cầu
                        </button>
                      </div>
                    </div>
                </div>
            </div>
        </div>`;
  $("#modal_confirm_box").html(confirmBox); 
  $("#modal_request_cancel").modal('show');
}
function deleteFileInList() {
    var index = parseInt($('#file-id').val());
    for (let [i, item] of fileInfos.entries()) {
        if (item.id == index) {
            $('#file_' + item.id).remove();
            if (item.isNew) {
                $('#file_' + item.id).remove();
                // $('#f_new_' + item.id).remove();
                let file = fileInfos[i];
                fileInfos.splice(i, 1);
                if (file.type == 1) {
                    deleteFileInDataTransfer(file.name, dt_asd);
                    if(dataArticle.type == 1){
                        document.getElementById('file_input_asd_review').files = dt_asd.files;
                    }else if(dataArticle.type == 2){
                        document.getElementById('file_input_asd').files = dt_asd.files;
                    }
                } else if (file.type == 2) {
                    deleteFileInDataTransfer(file.name, dt_content);
                    document.getElementById('file_input_content').files = dt_content.files;
                }
            } else {
                // $('#f_old_' + item.id).remove();
                fileInfos.splice(i, 1);
            }
            if(dataArticle.type == 1){
                // check disable nut gui duyet bai trang thai da duyet
                if(dataArticle.search_status == 2){
                    checkUnlockButton('sendreview');
                    checkRequestEdit( 'sendreview', 'file');
                }
            }else{
                checkUnlockButton('art');
                // check disable nut gui duyet bai trang thai da duyet
                if(dataArticle.search_status == 2){
                    checkRequestEdit( 'art', 'file');
                }
            }
            fileDeletes.push(item);
            if(dataArticle.status == -2) removeFileInServe(item.idServer);
            //Hiển thị danh sách file
            toogleDropFileSelect();
            break;
        }
    }
    $('#modal-delete').modal('hide');
}

function removeFileInServe(id) {
    $.ajax({
        type: "POST",
        data: {
            id: id
        },
        url: "/article/delete-file",
        success: function(result) {
            if (result.success) {

            } else {
                displayError(result.message);
            }
        },
        error: function(jqXHR, exception) {
            ajax_call_error(jqXHR, exception);
        }
    });
}

function checkFileName(file, type) {
    let check = false;
    if (fileInfos.length > 0) {
        for (let f of fileInfos) {
            // if (f.name == file.name && type == f.type) {
            if (f.name == file.name) {
                check = true;
                break;
            }
        }
    }
    return check;
}

function deleteFileInDataTransfer(name, dataTransfer) {
    for (let i = 0; i < dataTransfer.items.length; i++) {
        if (name === dataTransfer.items[i].getAsFile().name) {
            dataTransfer.items.remove(i);
            break;
        }
    }
}

function saveArticle(prefix, approve, autoSave = 0) {
    if(!dataArticle.isSave) return;
    if($('.modal.show').length){
        $('#modal-cf-luu-bai-viet').modal('hide');
        $('#modal-cf-gui-dang').modal('hide');
    }
    let typeArticle;
    let loading         = $("#loading-page");
    let book_id         = dataArticle.book_id;
    var formData        = new FormData();
    let status          = dataArticle.status;
    let search_status   = dataArticle.search_status;
    // 1 autoSave
    // 0 no autoSave

    //status -1 = dataArticle status
    if (approve == 1) {
        status = 0;
        search_status = 5;
    }else if(approve == 2){
        status = 32;
        search_status = 6
    }
    
    if(dataArticle.page == 'create'){
        typeArticle = 1;
        if (prefix == "art") typeArticle = 2;
    }else{
        typeArticle = dataArticle.type;
    }
    
    formData.append('booking_id', book_id);
    formData.append('site_id', $("#" + prefix + "_site_id").val() ? parseInt($("#" + prefix + "_site_id").val()) : (dataArticle.article.site_id ? dataArticle.article.site_id : 0));
    formData.append('fm_id', $("#" + prefix + "_format_id").val() ? parseInt($("#" + prefix + "_format_id").val()) : 0);
    formData.append('channel_id', $("#" + prefix + "_channel_id").val() ? parseInt($("#" + prefix + "_channel_id").val()) : 0);
    formData.append('domain', $("#" + prefix + "_site_id :selected").data('domaingroup') ? $("#" + prefix + "_site_id :selected").data('domaingroup') : '');
    formData.append('site_name', $("#" + prefix + "_site_id").find(':selected').text() ? $("#" + prefix + "_site_id").find(':selected').text() : '');
    formData.append('fm_name', $("#" + prefix + "_format_id").find(':selected').text() ? $("#" + prefix + "_format_id").find(':selected').text() : '');
    formData.append('channel_name', $("#" + prefix + "_channel_id").find(':selected').text() ? $("#" + prefix + "_channel_id").find(':selected').text() : '');
    
    formData.append('book_date', $("#" + prefix + "_book_date").val() ? $("#" + prefix + "_book_date").val() : moment(new Date()).format('DD-MM-YYYY'));
    formData.append('time_from', $("#" + prefix + "_time_from").val() ? $("#" + prefix + "_time_from").val() : '');

    formData.append('status', status);
    formData.append('type', typeArticle);
    formData.append('autoSave', autoSave);
    formData.append('search_status', search_status);
    formData.append('id_request', dataArticle.id_request);
    formData.append('page', dataArticle.page);

    formData.append('url_demo', $("#" + prefix + "_layout").val() ? $("#" + prefix + "_layout").val() : (dataArticle.article.url_demo ? dataArticle.article.url_demo : ''));
    formData.append('booking_id_add', $("#" + prefix + "_book_id").val() ? parseInt($("#" + prefix + "_book_id").val()) : 0);
    formData.append('approve', approve);
    if( prefix !== 'editor'){
        formData.append('post_type', $("#" + prefix + "_post_type").val() ? $("#" + prefix + "_post_type").val() : 'default');
        if([1,2,4,6,7].includes(dataArticle.search_status)){
            formData.append('title', $("#" + prefix + "_title").val() ? $("#" + prefix + "_title").val() : dataArticle.article.title_send_request);
        }else{
            formData.append('title', $("#" + prefix + "_title").val() ? $("#" + prefix + "_title").val() : '');
        }
        formData.append('description', $("#" + prefix + "_description").val() ? $("#" + prefix + "_description").val() : '');
        formData.append('price', $("#" + prefix + "_price").val()); 
    }

    if(autoSave == 0){
        if(approve !== 1){
            //file upload
            if(typeArticle == 2){
                let contentFile = $('#file_input_content').prop('files');
                for(let i = 0; i < contentFile.length; i++){
                    formData.append('content', contentFile[i]);
                }
                let asd = $('#file_input_asd').prop('files');
                for(let i = 0; i < asd.length; i++){
                    formData.append('asd', asd[i]);
                }
            }
            if(typeArticle == 1){
                let asd = $('#file_input_asd_review').prop('files');
                for(let i = 0; i < asd.length; i++){
                    formData.append('asd', asd[i]);
                }
            }
        }
        //file delete
        if(fileDeletes.length > 0) formData.append('fileDeletes', JSON.stringify(fileDeletes));
    }

    if(dataArticle.status !== -2 && dataArticle.search_status !== 5){
        dataArticle.requestEdit.explain.content = $('#list_content').find('textarea').val();
        if(dataArticle.type == 1){
            dataArticle.requestEdit.explain.asd = $('#list_ads_license_review').find('textarea').val();
        }else if(dataArticle.type == 2){
            dataArticle.requestEdit.explain.asd = $('#list_ads_license').find('textarea').val();
        }
        let fileChange = fileInfos.filter(s => s.isNew == true);
        if(fileChange.length > 0){
            dataArticle.requestEdit.file['stt'] = 1;
            dataArticle.requestEdit.file['new'] = JSON.stringify(fileChange);
        }
        formData.append('requestEdit', JSON.stringify(dataArticle.requestEdit)); 
        formData.append('oldArticle', JSON.stringify(dataArticle.article)); 
    }

    $.ajax({
        type: "POST",
        data: formData,
        url: "/article/publish",
        contentType: false,
        processData: false,
        beforeSend: function() {
            if (autoSave == 0) {
                loading.show();
            }
        },
        success: function(result) {
            if (autoSave == 0) {
                loading.hide();
            }
            if (result.success == true) {
                if (autoSave == 0) {
                    if(approve == 1){
                        displayMessage('Gửi duyệt bài thành công!');
                        let data = JSON.parse(result.data);
                        $.post("/mail/send", {
                            book_id: book_id,
                            type: 'mail_Tao_Yeu_Cau_Duyet_Bai',
                            link_noi_dung: JSON.stringify(data.link_noi_dung),
                            giay_phep_qc: JSON.stringify(data.giay_phep_qc)
                        }).done(function(data) {});
                    }else if(approve == 2){
                        displayMessage('Gửi đăng bài thành công!');
                        let data = JSON.parse(result.data);
                        $.post("/mail/send", {
                            book_id: book_id,
                            type: 'mail_Tao_YC_Dang_Bai',
                            link_noi_dung: JSON.stringify(data.link_noi_dung),
                            giay_phep_qc: JSON.stringify(data.giay_phep_qc)
                        }).done(function(data) {
    
                        });
                    }else{
                        displayMessage('Lưu bài thành công!');
                    }
                    setTimeout(()=>{
                        returnList();
                    },1000)
                }
            } else {
                displayError(result.message);
            }
        },
        error: function(jqXHR, exception) {
            ajax_call_error(jqXHR, exception);
        }
    });
}

function openModal(target) {
    $(target).modal('show');
}

function hideModal(target) {
    $(target).modal('hide');
}

function showForm2() {
    // chan auto save when site change
    dataArticle.isSave = false;
    let book_id = dataArticle.book_id;
    let site   = $("#editor_site_id :selected").data('domaingroup') ? $("#editor_site_id :selected").data('domaingroup') : 'kenh14';
    $.ajax({
        type: 'GET',
        url: '/article/detail-content?id=' + book_id,
        success: function(result) {
            let data = result.data ? result.data : [];
            if (data.length > 0) {
                if(data[0].version) data.versionContent = data[0].version;
                $('#sendreview_title').val(data[0].title ? data[0].title : '');
                let layout = window.location.protocol + '//' + window.location.hostname + '/preview/pc_view/' + site + "/" + book_id + "/" + (data.versionContent ? data.versionContent : 1);
                $('#sendreview_layout').val(layout);
            }
        },
        error: function(err) {
            displayError(err);
        }
    });
    
    $('#dung_bai_tab').hide();
    $('#gui_duyet_dung_bai').show();
    $('h3[class="title"]').text('Gửi duyệt');
    $('#sendreview_channel_id').val($('#editor_channel_id').val()).trigger('change');
    $('#sendreview_format_id').val($('#editor_format_id').val()).trigger('change');
    // $('#frame_editor').attr("src", 'https://apidangtin.admicro.vn/Signout.aspx');
    setTimeout(() => {
        dataArticle.isSave = true;
    }, 1000);
}

function cancelBuild(target) {
    hideModal(target);
    let book_id = dataArticle.book_id;
    $.ajax({
        type: 'POST',
        url: '/article/cancel-build-article',
        data: {
            id: book_id
        },
        success: function(result) {
            if (result.success) {
                displayMessage('Thành công');
                setTimeout(()=>{
                    returnList();
                }, 500);
            } else {
                displayError(result.message);
            }
        },
        error: function(jqXHR, exception) {
            ajax_call_error(jqXHR, exception);
        }
    });
}

function checkUnlockButton(prefix) {
    let valid = validateForm(prefix);
    if (valid) {
        $("button[name='approve']").prop('disabled', false);
    } else {
        $("button[name='approve']").prop('disabled', true);
    }
    if(dataArticle.search_status == 2){
        if(dataArticle.isLockPublish || (!$("#" + prefix +  "_book_id").val() || ($("#" + prefix +  "_book_id").val() && $("#" + prefix +  "_book_id").val() == 0))){
            $("button[name='approve']").prop('disabled', true);
        }
        if (valid) {
            $("button[name='save']").prop('disabled', false);
        } else {
            $("button[name='save']").prop('disabled', true);
        }
    }
    if (dataArticle.isSave && dataArticle.status == -2) {
        saveArticle(prefix, 0, 1);
    }
}

function editContent() {
    $('#dung_bai_tab').show();
    $('#gui_duyet_dung_bai').hide();
    if (dataArticle.page == 'edit') $('#dung_bai_tab ul[role="tablist"]').hide();
    dataArticle.isSave = false;
    let site_id;
    if([1,2,4,5,6,7].includes(dataArticle.search_status)){
        site_id = dataArticle.article.site_id;
    }else{
        site_id = $('#sendreview_site_id').val();
    }
    if(site_id){
        $('#editor_site_id').val(site_id).trigger('change');
    }
    $("button[name='btn-editor']").prop('disabled', false);
    getEditorToken('#frame_editor', dataArticle.book_id);
    setTimeout(() => {
        dataArticle.isSave = true;
    }, 1000);
}

function uploadFile(type, files) {
    let loading  = $("#loading-page");
    var formData = new FormData();
    let book_id  = dataArticle.book_id;
    formData.append('booking_id', book_id);
    formData.append('type', type);
    //file upload
    for (let i = 0; i < files.length; i++) {
        formData.append(type == 1 ? 'asd' : 'content', files[i]);
    }
    $.ajax({
        type: "POST",
        data: formData,
        url: "/article/upload",
        contentType: false,
        processData: false,
        beforeSend: function() {
            loading.show();
        },
        success: function(result) {
            if (result.success == true) {
                let data = result.data;
                if (data && data.length > 0) {
                    for (let item of data) {
                        for (let file of fileInfos) {
                            if(item.success){
                                if (item.data.name == file.name) {
                                    file.path = item.data.path;
                                    file.path_cloud = item.data.path_cloud;
                                    file.idServer = item.data.id;
                                    $('#file_' + file.id).find('a').attr('href', item.data.path_cloud);
                                    // if(file.isNew){
                                    //     $('#f_new_' + file.id).find('a').attr('href', item.data.path_cloud);
                                    // }else{
                                    //     $('#f_old_' + file.id).find('a').attr('href', item.data.path_cloud);
                                    // }
                                    break;
                                }
                            }else{
                                if(file.name == item.name){
                                    $('#file_' + file.id).find('a').attr('href', item.data.path_cloud);
                                    // if(fileLocal.isNew){
                                    //     $('#f_new_' + file.id).remove();
                                    // }else{
                                    //     $('#f_old_' + file.id).remove();
                                    // }
                                }
                            }  
                        }
                    }
                }
            } else {
                displayError(result.message);
                for(let file of files){
                    for(let fileLocal of fileInfos){
                        if(file.name == fileLocal.name){
                            if(fileLocal.isNew){
                                $('#f_new_' + fileLocal.id).remove();
                            }else{
                                $('#f_old_' + fileLocal.id).remove();
                            }
                        }
                    }
                }
            }
            loading.hide();
        },
        error: function(jqXHR, exception) {
            loading.hide();
            ajax_call_error(jqXHR, exception);
        }
    });
}

function initFileEdit(arrFile) {
    try {
        let totalFiles = arrFile.length;
        for (let [i, file] of arrFile.entries()) {
            let detail = file.detail[file.detail.length - 1];
            let file_local = {
                id: i + dataArticle.indexFile,
                name: file.name,
                version: 1,
                created_at: new Date(detail.created_at).toLocaleDateString('pt-PT'),
                type: file.type,
                isNew: false,
                path: detail.path,
                path_cloud: detail.path_cloud,
                size: detail.size,
                idServer: detail.id_detail
            };
            fileInfos.push(file_local);
            //Hiển thị danh sách file
            toogleDropFileSelect();
            addFileHtml2(file_local, true);
            // let a = addFileHtml(file_local, 0);
            //type = 1 Giấy phép quảng cáo; 
            //type = 2 Nội dung bài viết;
            // if (file.type == 1) {
            //     $('#tb_ads_license').append(a);
            // } else if (file.type == 2) {
            //     $('#tb_list_content').append(a);
            // }
            if (i == totalFiles - 1) {
                dataArticle.indexFile = file_local.id + 1;
            } else {
                dataArticle.indexFile = file_local.id;
            }
        }
    } catch (error) {

    }
}

function toogleDropFileSelect(){
    try {
        if(fileInfos.filter(s => s.type == 1).length == 0){  
            $(".list-ads-file").hide();
        }else{
            $(".list-ads-file").show();
        }
        if(fileInfos.filter(s => s.type == 2).length == 0){
            $(".list-content-file").hide();
        }else{
            $(".list-content-file").show();
        }
    } catch (error) {
        
    }
}

function preview() {
    let book_id = dataArticle.book_id;
    let site = $("#editor_site_id :selected").data('domaingroup');
    if(site){
        let link_preview = window.location.protocol + '//' + window.location.hostname + "/preview/pc_view/" + site + "/" + book_id + "/" + (dataArticle.versionContent ? dataArticle.versionContent : 1);
        window.open(link_preview, '_blank').focus();
    }else{
        displayError("Bạn chưa chọn site");
    }
}

function returnList() {
    window.location.href = '/article';
}

function checkApprove(book_id, domaingroup) {
    $.ajax({
        type: 'GET',
        url: '/article/check-approve?book_id=' + book_id + '&domain=' + domaingroup,
        success: function(result) {
            if (result.success) {
                if (result.valid) {
                    dataArticle.dataApprove = result.data;
                    openModal('#modal_sendApproveArticle');
                } else {
                    openModal('#modal_EditArticle');
                    $('#modal_EditArticle a').attr('href', '/article/edit/' + book_id);
                }
            } else {
                displayError(result.message);
            }
        },
        error: function(jqXHR, exception) {
            ajax_call_error(jqXHR, exception);
        }
    });
}

function approve() {
    try {
        let loading = $("#loading-page");
        $.ajax({
            type: 'POST',
            url: '/article/approve',
            data: {
                param: JSON.stringify(dataArticle.dataApprove)
            },
            beforeSend: function() {
                loading.show();
            },
            success: function(result) {
                loading.hide();
                if (result.success) {
                    displayMessage("Thành công");
                    $.post("/mail/send", {
                        book_id: dataArticle.dataApprove.booking_id,
                        type: 'mail_Tao_Yeu_Cau_Duyet_Bai',
                        link_noi_dung: JSON.stringify(result.link_noi_dung),
                        giay_phep_qc: JSON.stringify(result.giay_phep_qc)
                    }).done(function(data) {});
                    returnList();
                } else {
                    displayError(result.message);
                }
                hideModal('#modal_sendApproveArticle');
                dataArticle.dataApprove = '';
            },
            error: function(jqXHR, exception) {
                ajax_call_error(jqXHR, exception);
            },
            complete: function(jqXHR, result) {
                loading.hide();
            }
        });
    } catch (error) {

    }
}

function checkPublish(book_id) {
    $.ajax({
        type: 'GET',
        url: '/article/check-publish?book_id=' + book_id,
        success: function(result) {
            if (result.success) {
                if (result.valid) {
                    dataArticle.dataApprove = result.data;
                    openModal('#modal_sendPublishArticle');
                } else {
                    openModal('#modal_EditArticle');
                    $('#modal_EditArticle a').attr('href', '/article/edit/' + book_id);
                }
            } else {
                displayError(result.message);
            }
        },
        error: function(jqXHR, exception) {
            ajax_call_error(jqXHR, exception);
        }
    });
}

// function publish(prefix, approve) {
//     $('#modal-cf-luu-bai-viet').modal('hide');
//     var loading  = $("#loading-page");
//     var formData = new FormData();
//     let book_id  = $('input[type="hidden"][name="booking_id"]').val();

//     formData.append('site_id', parseInt($("#" + prefix + "_site_id").val()));
//     formData.append('fm_id', parseInt($("#" + prefix + "_format_id").val()));
//     formData.append('channel_id', parseInt($("#" + prefix + "_channel_id").val()));
//     formData.append('post_type', $("#" + prefix + "_post_type").val());
//     formData.append('title', $("#" + prefix + "_title").val() ? $("#" + prefix + "_title").val() : '');
//     formData.append('description', $("#" + prefix + "_description").val() ? $("#" + prefix + "_description").val() : '');
//     formData.append('price', $('input[type="hidden"][name="price"]').val());
//     formData.append('booking_id', book_id);
//     formData.append('type', dataArticle.type);
//     formData.append('status', dataArticle.status);
//     formData.append('search_status', (approve == 2 ? 6 : dataArticle.search_status));
//     formData.append('id_request', dataArticle.id_request);
//     formData.append('page', dataArticle.page);
//     formData.append('domain', $("#" + prefix + "_site_id :selected").data('domaingroup'));
//     formData.append('site_name', $("#" + prefix + "_site_id").find(':selected').text());
//     formData.append('fm_name', $("#" + prefix + "_format_id").find(':selected').text());
//     formData.append('channel_name', $("#" + prefix + "_channel_id").find(':selected').text());
//     formData.append('booking_id_add', parseInt($("#" + prefix + "_book_id").val()));
//     formData.append('url_demo', $("#" + prefix + "_layout").val() ? $("#" + prefix + "_layout").val() : '');
//     formData.append('approve', approve);

//     if(dataArticle.status !== -2 && dataArticle.search_status !== 5){      
//         dataArticle.requestEdit.explain.content = $('textarea[name="request_edit_file_content"]').val();
//         dataArticle.requestEdit.explain.asd = $('textarea[name="request_edit_file_asd"]').val();
//         let fileChange = fileInfos.filter(s => s.isNew == true);
//         if(fileChange.length > 0){
//             dataArticle.requestEdit.file['stt'] = 1;
//             dataArticle.requestEdit.file['new'] = JSON.stringify(fileChange);
//         }
//         formData.append('requestEdit', JSON.stringify(dataArticle.requestEdit)); 
//         formData.append('oldArticle', JSON.stringify(dataArticle.article));
//     }

//     $.ajax({
//         type: "POST",
//         data: formData,
//         url: "/article/publish",
//         contentType: false,
//         processData: false,
//         beforeSend: function() {
//             loading.show();
//         },
//         success: function(result) {
//             loading.hide();
//             if (result.success == true) {
//                 displayMessage(result.message);
//                 if(approve == 2){
//                     let data = JSON.parse(result.data);
//                     $.post("/mail/send", {
//                         book_id: book_id,
//                         type: 'mail_Tao_YC_Dang_Bai',
//                         link_noi_dung: JSON.stringify(data.link_noi_dung),
//                         giay_phep_qc: JSON.stringify(data.giay_phep_qc)
//                     }).done(function(data) {

//                     });
//                 }
//                 window.setTimeout(function() {
//                     returnList();
//                 }, 1000);
//             } else {
//                 displayError(result.message);
//             }
//         },
//         error: function(jqXHR, exception) {
//             loading.hide();
//             ajax_call_error(jqXHR, exception);
//         }
//     });
// }

function cancelArticle(id_book, id_request, search_status){
    var loading = $("#loading-page");
    $.ajax({
        type: 'POST',
        url: '/article/cancel-article',
        data: {
            id_request: id_request, 
            id_book: id_book
        },
        beforeSend: function() {
            loading.show();
        },
        success: function(result) {
            loading.hide();
            if (result.success) {
                displayMessage(result.message);

                //Chờ duyệt, Gửi duyệt thì gửi email
                if([1,5].includes(search_status)){
                    $.post("/mail/send", {
                        book_id: id_book,
                        cancel_type:'kh',
                        type: 'mail_Huy_YC_DuyetBai'
                    }).done(function(data) {});
                }
                returnList();
            } else {
                displayError(result.message);
            }
        },
        error: function(jqXHR, exception) {
            loading.hide();
            ajax_call_error(jqXHR, exception);
        }
    });
}

function lockInputWhenLoad(hideButton){
    // if(price_allow == 0){
    //     $("#art_format_id").prop("disabled", true);
    //     $("#editor_format_id").prop("disabled", true);
    //     $("#sendreview_format_id").prop("disabled", true);
    // }
    // if(channelAllowId.length == 0){
    //     $("#art_channel_id").prop("disabled", true);
    //     $("#editor_channel_id").prop("disabled", true);
    //     $("#sendreview_channel_id").prop("disabled", true);
    // }
    // $("#art_description").prop("readonly", true);
    // $("#sendreview_description").prop("readonly", true);
    // $("#art_title").prop("readonly", true);
    // $("#sendreview_title").prop("readonly", true);
    // $("#art_post_type").prop("disabled", true);
    // $("#sendreview_post_type").prop("disabled", true);
    // $('.file-upload .f-upload *[onclick]').removeAttr('onclick').off('click');
    // $('.file-upload .f-upload').off('drop');
    // $('.file-upload .f-upload').find('.btn-file').hide();
    // if(dataArticle.search_status == 1){
    //     $('#file-content , #file-content + p').hide();
    //     $('#file-ads, #file-ads + p').hide();
    // }
    // if(hideButton){
    //     $("#gui_duyet_dung_bai .btn").hide();
    //     $("#article-detail .btn").hide();
    // }
}

function duyetLayout(){
    let book_id  = dataArticle.book_id;
    let loading  = $("#loading-page");
    $.ajax({
        type: 'POST',
        url: '/article/duyet-layout',
        data: {id_request: dataArticle.id_request, id_book: book_id},
        beforeSend: function() {
            loading.show();
        },
        success: function(result) {
            loading.hide();
            if (result.success) {
                displayMessage(result.message);
                $.post("/mail/send", {
                    book_id: book_id,
                    type: 'mail_KH_Duyet_LO'
                }).done(function(data) {});
                returnList();
            } else {
                displayError('Lỗi cập nhật');
            }
        },
        error: function(jqXHR, exception) {
            loading.hide();
            ajax_call_error(jqXHR, exception);
        }
    });
}

function requestCancel(book_id, id_request, status, total_request_cancel){
    let loading  = $("#loading-page");
    let reason   = $("#reason_cancel").val();
    if(reason && reason.trim().length > 0){
        $.ajax({
            type: 'POST',
            url: '/article/request-cancel',
            data: {
                id_request: id_request,
                reason: reason,
                book_id: book_id,
                status_art: status,
                id_count: (total_request_cancel + 1)
            },
            beforeSend: function() {
                loading.show();
            },
            success: function(result) {
                loading.hide();
                if (result.success) {
                    displayMessage(result.message);
                    $.post("/mail/send", {
                        book_id: book_id,
                        type: 'mail_gui_yeu_cau_huy',
                        ma_yeu_cau_huy: (total_request_cancel + 1),
                        ly_do: reason
                    }).done(function(data) {});
                    returnList();
                } else {
                    displayError('Lỗi gửi yêu cầu');
                }
            },
            error: function(jqXHR, exception) {
                loading.hide();
                ajax_call_error(jqXHR, exception);
            }
        });
    }else{
        displayError('Bạn vui lòng nhập lý do hủy!');
    }
}

function checkRequestEdit(prefix, type){
    //status 1 gửi 2 hoàn thành 
    if(dataArticle.page !== 'create' && dataArticle.requestEdit && ![-2, 5].includes(dataArticle.search_status)){
        let check               = false;
        let checkAllow          = false;
        let list_channel_allow  = JSON.parse(dataArticle.article.list_channel_allow);
        let notice2             = false;
        let explain             = '';
        
        switch(type){
            case 'format':
                if([1,2,6].includes(dataArticle.search_status)){
                    //Nếu chưa có Mức giá được duyệt, thì Chọn Loại bài  khác với Loại bài hiện tại 
                    if(dataArticle.article.price_allow == 0){
                        if(parseInt($("#" + prefix + "_format_id").val()) != dataArticle.article.fm_id){
                            check = true;
                        }
                    }else{
                        //Nếu đã có Mức giá  được duyệt, chọn Loại bài lớn hơn Mức giá  được duyệt
                        if(parseInt($("#" + prefix + "_format_id option:selected").data('price')) > dataArticle.article.price_allow){
                            check   = true;
                            notice2 = true;
                        }else{
                            // Nếu chọn Loại bài nhỏ hơn Mức giá  được duyệt check thay đổi so với hiện tại
                            if(parseInt($("#" + prefix + "_format_id").val()) != dataArticle.article.fm_id){
                                checkAllow = true;
                            }
                        }
                    }
                } else if([7,4].includes(dataArticle.search_status)){
                    check = true;
                }
                if(check || dataArticle.overQuota){
                    dataArticle.requestEdit.format['text_new'] = $("#" + prefix + "_format_id").find(':selected').text();
                    dataArticle.requestEdit.format['id_new']   = $("#" + prefix + "_format_id").val();
                    dataArticle.requestEdit.format['stt']      = 1;
                    dataArticle.requestEdit.price['stt']       = 1;
                    dataArticle.requestEdit.price['new']       = numberFormat.format($("#" + prefix + "_format_id option:selected").data('price'));
                    // chon loai bai lon hon muc gia dc duyet hien thi thong bao 2
                    if(notice2){
                        $("#" + prefix + "_format_id ~ div[name='notice-format']").show();
                        setTimeout(()=>{
                            $("#" + prefix + "_format_id ~ div[name='notice-format']").hide();
                        }, 3000);
                    }else{
                        $("#" + prefix + "_format_id ~ div[name='notice-format1']").show();
                        setTimeout(()=>{
                            $("#" + prefix + "_format_id ~ div[name='notice-format1']").hide();
                        }, 3000);
                    }
                }else{
                    if(dataArticle.requestEdit){
                        if(dataArticle.requestEdit.format){
                            delete dataArticle.requestEdit.format.text_new;
                            delete dataArticle.requestEdit.format.id_new;
                            delete dataArticle.requestEdit.format.stt;
                        }
                        if(dataArticle.requestEdit.price){
                            delete dataArticle.requestEdit.price.new;
                            delete dataArticle.requestEdit.price.stt;
                        }
                    }
                }
                // Luu thay doi chon loai bai nho hon muc gia dc duyet
                if(checkAllow){
                    dataArticle.allowEdit.format['new'] = $("#" + prefix + "_format_id").find(':selected').text();
                    dataArticle.allowEdit.price['new']  = parseInt($("#" + prefix + "_format_id option:selected").data('price'));
                }else{
                    if(dataArticle.allowEdit.format){
                        delete dataArticle.allowEdit.format.new;
                    }
                    if(dataArticle.allowEdit.price){
                        delete dataArticle.allowEdit.price.new;
                    }
                }
                break;
            case 'channel':
                if([1,2,6].includes(dataArticle.search_status)){
                    //Nếu chưa có Chuyên mục được duyệt, thì Chọn Chuyên mục  khác với Chuyên mục hiện tại
                    if(list_channel_allow.length == 0){
                        if(parseInt($("#" + prefix + "_channel_id").val()) != dataArticle.article.channel_id){
                            check = true;
                        }
                    }else{
                        let channel_id = $("#" + prefix + "_channel_id").val();
                        //Nếu đã có Chuyên mục được duyệt, chọn Chuyên mục khác với Chuyên mục được duyệt
                        if(!list_channel_allow.includes(channel_id)){
                            check   = true;
                            notice2 = true;
                        }else{
                            // Nếu chọn chuyên mục đúng chuyên mục được duyệt check thay đổi so với hiện tại
                            if(parseInt($("#" + prefix + "_channel_id").val()) != dataArticle.article.channel_id){
                                checkAllow = true;
                            }
                        }
                    }
                }else if([7,4].includes(dataArticle.search_status)){
                    check = true;
                }
                if(check || dataArticle.overQuota){
                    dataArticle.requestEdit.channel['text_new'] = $("#" + prefix + "_channel_id").find(':selected').text();
                    dataArticle.requestEdit.channel['id_new']   = $("#" + prefix + "_channel_id").val();
                    dataArticle.requestEdit.channel['stt']      = 1;
                    if(notice2){
                        $("#" + prefix + "_channel_id ~ div[name='notice-channel']").show();
                        setTimeout(()=>{
                            $("#" + prefix + "_channel_id ~ div[name='notice-channel']").hide();
                        }, 3000);
                    }else{
                        $("#" + prefix + "_channel_id ~ div[name='notice-channel1']").show();
                        setTimeout(()=>{
                            $("#" + prefix + "_channel_id ~ div[name='notice-channel1']").hide();
                        }, 3000);
                    }
                } else {
                    if(dataArticle.requestEdit && dataArticle.requestEdit.channel){
                        delete dataArticle.requestEdit.channel.text_new;
                        delete dataArticle.requestEdit.channel.id_new;
                        delete dataArticle.requestEdit.channel.stt;
                    }
                }
                if(checkAllow){
                    dataArticle.allowEdit.channel['new'] = $("#" + prefix + "_channel_id").find(':selected').text();
                }else{
                    if(dataArticle.allowEdit.channel){
                        delete dataArticle.allowEdit.channel.new;
                    }
                }
                break;
            case 'post_type':
                if([1,2,6,4,7].includes(dataArticle.search_status)){
                    if($("#" + prefix + "_post_type").val() !== dataArticle.article.post_type){
                        check = true;
                    }
                }
                if(check){
                    dataArticle.requestEdit.post_type['new']      = $("#" + prefix + "_post_type").val();
                    dataArticle.requestEdit.post_type['text_new'] = $("#" + prefix + "_post_type").val() == 'default' ? 'Bài Thường' : ($("#" + prefix + "_post_type").val() == 'webuy' ? 'Bài Webuy' : 'Bài Magazine');
                    dataArticle.requestEdit.post_type['stt']      = 1;
                    $("#" + prefix + "_post_type ~ div").show();
                    setTimeout(()=>{
                        $("#" + prefix + "_post_type ~ div").hide();
                    }, 3000);
                } else {
                    if(dataArticle.requestEdit && dataArticle.requestEdit.post_type){
                        delete dataArticle.requestEdit.post_type.new;
                        delete dataArticle.requestEdit.post_type.stt;
                    }
                }
                break;
            case 'book_date':
                if([2,4,6,7].includes(dataArticle.search_status)){
                    if($("#" + prefix + "_book_date").val() !== dataArticle.article.book_date){
                        check = true;
                    }
                }
                
                if(([4,7].includes(dataArticle.search_status) && check) || ([2,6].includes(dataArticle.search_status) && check && dataArticle.overQuota)){
                    dataArticle.requestEdit.book_date['new'] = $("#" + prefix + "_book_date").val();
                    dataArticle.requestEdit.book_date['stt'] = 1;
                    if([4,7].includes(dataArticle.search_status)){
                        $("#msgArticleQuota").html("Thay đổi sẽ tạo yêu cầu sửa.");
                        setTimeout(()=>{
                            $("#msgArticleQuota").html("");
                        }, 3000);
                    }
                } else {
                    if(dataArticle.requestEdit && dataArticle.requestEdit.book_date){
                        delete dataArticle.requestEdit.book_date.new;
                        delete dataArticle.requestEdit.book_date.stt;
                    }
                }
                break;
            case 'time_from':
                var _time_from = $("#" + prefix + "_time_from").val();
                if(_time_from !== ''){
                    if([2,4,6,7].includes(dataArticle.search_status)){
                        if(_time_from !== dataArticle.article.time_from){
                            check = true;
                        }
                    }
                }
                
                if(([4,7].includes(dataArticle.search_status) && check) || ([2,6].includes(dataArticle.search_status) && check && dataArticle.overQuota)){
                    dataArticle.requestEdit.time_from['new'] = _time_from;
                    dataArticle.requestEdit.time_from['stt'] = 1;
                    if([4,7].includes(dataArticle.search_status)){
                        $("#msgArticleQuota").html("Thay đổi sẽ tạo yêu cầu sửa.");
                        setTimeout(()=>{
                            $("#msgArticleQuota").html("");
                        }, 3000);
                    }
                } else {
                    if(dataArticle.requestEdit && dataArticle.requestEdit.time_from){
                        delete dataArticle.requestEdit.time_from.new;
                        delete dataArticle.requestEdit.time_from.stt;
                    }
                }
                break;
            case 'title':
                if([1,2,6,4,7].includes(dataArticle.search_status)){
                    if($("#" + prefix + "_title").val().trim() && $("#" + prefix + "_title").val().trim() !== dataArticle.article.title_send_request){
                        check = true;
                    } 
                }
                if(check){
                    dataArticle.requestEdit.title['new'] = $("#" + prefix + "_title").val();
                    dataArticle.requestEdit.title['stt'] = 1;
                    $("." + prefix + "_title_alert").show();
                    setTimeout(()=>{
                        $("." + prefix + "_title_alert").hide();
                    }, 3000);
                }else{
                    if(dataArticle.requestEdit && dataArticle.requestEdit.title){
                        delete dataArticle.requestEdit.title.new;
                        delete dataArticle.requestEdit.title.stt;
                    }
                }
                break;
            case 'description':
                if($("#" + prefix + "_description").val().trim() && ($("#" + prefix + "_description").val().trim() !== dataArticle.article.description)){
                    checkAllow = true;
                }
                if(checkAllow){
                    dataArticle.allowEdit.description['new'] = $("#" + prefix + "_description").val();
                }else{
                    if(dataArticle.allowEdit.description){
                        delete dataArticle.allowEdit.description.new;
                    }
                }
                break;
            case 'explainAds':
                if(prefix == 'art'){
                    explain = $('#list_ads_license textarea[name="request_edit_file_art"]').val();
                    if(explain.trim().length > 0){
                        $('#list_ads_license ~ div').show();
                        dataArticle.requestEdit.explain['stt'] = 1;
                        setTimeout(()=>{
                            $('#list_ads_license ~ div').hide();
                        }, 3000);
                    }else{
                        if(dataArticle.requestEdit.explain.content.length == 0){
                            delete dataArticle.requestEdit.explain.stt;
                        }
                    }
                }else{
                    explain = $('#list_ads_license_review textarea[name="request_edit_file_sendreview"]').val();
                    if(explain.trim().length > 0){
                        $('#list_ads_license_review ~ div').show();
                        dataArticle.requestEdit.explain['stt'] = 1;
                        setTimeout(()=>{
                            $('#list_ads_license ~ div').hide();
                        }, 3000);
                    }else{
                        if(dataArticle.requestEdit.explain.content.length == 0){
                            delete dataArticle.requestEdit.explain.stt;
                        }
                    }
                }
                dataArticle.requestEdit.explain.asd = explain;
                break;
            case 'explainContent':
                if(prefix == 'art'){
                    explain = $('#list_content textarea[name="request_edit_file_art"]').val();
                }else{
                    explain = $('#list_content textarea[name="request_edit_file_sendreview"]').val();
                }
                if(explain.trim().length > 0){
                    $('#list_content ~ div').show();
                    setTimeout(()=>{
                        $('#list_content ~ div').hide();
                    }, 3000);
                    dataArticle.requestEdit.explain['stt'] = 1;
                }else{
                    if(dataArticle.requestEdit.explain.asd.length == 0){
                        delete dataArticle.requestEdit.explain.stt;
                    }
                }
                dataArticle.requestEdit.explain.content = explain;
                break;    
            case 'file':

                break;
            default: break;
        }
        if(dataArticle.search_status == 2){
            let fileChange = fileInfos.filter(s => s.isNew == true);
            if((dataArticle.requestEdit.format.stt && dataArticle.requestEdit.format.stt == 1) || (dataArticle.requestEdit.channel.stt && dataArticle.requestEdit.channel.stt == 1) || (dataArticle.requestEdit.post_type.stt && dataArticle.requestEdit.post_type.stt == 1) || (dataArticle.requestEdit.title.stt && dataArticle.requestEdit.title.stt == 1)
            || (explain.length > 0) || fileChange.length > 0){
                dataArticle.checkCreateRequest = true;
            }else{
                dataArticle.checkCreateRequest = false;
            }
            console.log("checkCreateRequest", dataArticle.checkCreateRequest);
            if(dataArticle.checkCreateRequest){
                $("button[name='approve']").prop('disabled', true);
            }
        }
    }
}

function generateRequestEdit(){
    let prefix = dataArticle.article.type == 1 ? 'sendreview' : 'art';
    if(dataArticle.page !== 'create'){
        dataArticle.requestEdit = {
            site: {text_old: $("#" + prefix + "_site_id").find(':selected').text() ? $("#" + prefix + "_site_id").find(':selected').text() : dataArticle.site_name},
            format: {text_old: $("#" + prefix + "_format_id").find(':selected').text(), id_old: dataArticle.article.fm_id},
            channel: {text_old: $("#" + prefix + "_channel_id").find(':selected').text(), id_old: dataArticle.article.channel_id},
            title:  {old: dataArticle.article.title_send_request},
            post_type: {old: dataArticle.article.post_type, text_old: (dataArticle.article.post_type == 'default') ? 'Bài Thường' : (dataArticle.article.post_type == 'webuy' ? 'Bài Webuy' : 'Bài Magazine')},
            explain: {content:'', asd:''},
            file: {old: JSON.stringify(fileInfos)},
            price: {old: dataArticle.article.price},
            time_from: {old: dataArticle.article.time_from},
            book_date: {old: dataArticle.article.book_date},
            id_count: dataArticle.totalRequestEdit,
            status: dataArticle.search_status,
            finish: 0,
            quota: 0,
            description: {old: dataArticle.article.description},
            booking: "",
            price_allow: 0,
            url_demo: {old: dataArticle.article.url_demo}
        }
        dataArticle.allowEdit = {
            format: {old: $("#" + prefix + "_format_id").find(':selected').text()},
            channel: {old: $("#" + prefix + "_channel_id").find(':selected').text()},         
            description: {old: dataArticle.article.description},   
            price: {old: dataArticle.article.price},
            time_from: {old: dataArticle.article.time_from},
            book_date: {old: dataArticle.article.book_date}
        };
    }
}

function checkEditFile(){
    let check = $('#checkRequestEdit').is(":checked");
    if(check){
        $("#changeFileRequest").show();
    }else{
        $("#changeFileRequest").hide();
    }
}

function addFiletoDataTranfer(files, type){
    let arrFileUpload    = [];
    let nameFileErrExist = '';
    let nameFileErrType  = '';
    
    for (let file of files) {
        let check = checkFileName(file, type);
        if (check) {
            nameFileErrExist += file.name + ' <br>';
        } else {
            let typeFileArr = file.name.split('.');
            let typeFile = typeFileArr[(typeFileArr.length - 1)];
            if(['doc', 'docx', 'pdf', 'png', 'jpeg', 'gif', 'jpg'].includes(typeFile)){
                if (type == 1) {
                    dt_asd.items.add(file);
                } else if (type == 2) {
                    dt_content.items.add(file);
                }
                arrFileUpload.push(file);
            }else{
                nameFileErrType += file.name + ' <br>';
            }
        }
    }
    if([1,2,4,6,7].includes(dataArticle.search_status) && arrFileUpload.length > 0){
        let textHint = '';
        if(dataArticle.type == 2){
            if(type == 1){
                textHint = '#list_ads_license ~ div';
            }else{
                textHint = '#list_content ~ div';
            }
        }else{
            if(type == 1){
                textHint = '#list_ads_license_review ~ div';
            }else{
                textHint = '#list_content ~ div';
            }
        }
        $(textHint).show();
        setTimeout(()=>{
            $(textHint).hide();
        }, 3000);
        if(dataArticle.search_status == 2){
            $("button[name='approve']").prop('disabled', true);
        }
    }
    if(nameFileErrExist.length > 0) nameFileErrExist += "File đã tồn tại! <br>";
    if(nameFileErrType.length > 0) nameFileErrType += "Định dạng không hỗ trợ!";
    return {arrFileUpload : arrFileUpload, nameFileErr: nameFileErrExist + nameFileErrType};
}

function confirmSaveArticle(prefix, approve){
    try {
        setTimeout(() =>{
            let length = setTemplatePopupConfirm();
            if(length.htmlAllowLength > 0 || length.htmlRequestLength > 0){
                $('#modal-cf-luu-bai-viet').modal('show');
                $('#confirm-save-article').removeAttr('onclick');
                $('#confirm-save-article').attr('onClick', `saveArticle("` + prefix + `",'`+ approve + `', 0)`);
            } else {
                saveArticle(prefix,approve, 0);
            }
        }, 100);
    } catch (error) {
        
    }
}

function setTemplatePopupConfirm(){
    let allowEdit   = dataArticle.allowEdit;
    let requestEdit = dataArticle.requestEdit;
    let htmlAllow   = '';
    let htmlRequest = '';
    let isCheckFileArray = true;

    for (var key in allowEdit) {
        if (allowEdit.hasOwnProperty(key)) {
            if(allowEdit[key].hasOwnProperty('new')){
                switch(key){
                    case 'description': htmlAllow += '<tr><td>Mô tả:</td>'; break;
                    case 'format':  htmlAllow += '<tr><td>Loại bài:</td>'; break;
                    case 'channel':  htmlAllow += '<tr><td>Chuyên mục:</td>'; break;
                    case 'price':  htmlAllow += '<tr><td>Giá:</td>'; break;
                    case 'time_from':  htmlAllow += '<tr><td>Giờ lên site:</td>'; break;
                    case 'book_date':  htmlAllow += '<tr><td>Ngày lên site:</td>'; break;
                    default: break;
                }
                if(key == 'description'){
                    let lines = dataArticle.type == 2 ? document.getElementById("art_description").clientHeight + document.getElementById("art_description").scrollHeight : document.getElementById("sendreview_description").clientHeight + document.getElementById("sendreview_description").scrollHeight;
                    htmlAllow += '<td><textarea style="width: 100%; border:none;height:'+ lines +'px;pointer-events:none;" class="text-primary-active" readonly>'+ allowEdit[key].new +'</textarea></td></tr>';
                    // htmlAllow += '<td><pre style="font-size: 1em;margin-bottom: 0;">'+ allowEdit[key].new +'</pre></td></tr>';
                }else{
                    htmlAllow += '<td>'+ allowEdit[key].new +'</td></tr>';
                }
            }
        }
    }
    
    if(htmlAllow.length == 0){
        $('#modal-cf-luu-bai-viet-luu-wapper').hide()
    }else{
        $('#modal-cf-luu-bai-viet-luu-wapper').show();
        $('#modal-cf-luu-bai-viet-luu').html(htmlAllow);
    }
    for (var key in requestEdit) {
        if (requestEdit.hasOwnProperty(key)) {
            if(requestEdit[key].hasOwnProperty('stt')){
                switch(key){
                    case 'title': htmlRequest += '<tr><td>Tiêu đề:</td>'; break;
                    case 'format':  htmlRequest += '<tr><td>Loại bài:</td>'; break;
                    case 'channel':  htmlRequest += '<tr><td>Chuyên mục:</td>'; break;
                    case 'price':  htmlRequest += '<tr><td>Giá:</td>'; break;
                    case 'time_from':  htmlRequest += '<tr><td>Giờ lên site:</td>'; break;
                    case 'book_date':  htmlRequest += '<tr><td>Ngày lên site:</td>'; break;
                    case 'post_type':  htmlRequest += '<tr><td>Định dạng:</td>'; break;
                    case 'explain': 
                        // thay đổi mô tả không check file array
                        isCheckFileArray = false;
                        // có thay đổi mô tả nội dung bài viết
                        let fileContent = fileInfos.filter(i => (i.type == 2 && i.isNew == true));
                        let fileAsd = fileInfos.filter(i => (i.type == 1 && i.isNew == true));
                        if(requestEdit[key].content){
                            htmlRequest += '<tr><td>Nội dung bài viết:</td> <td>' + requestEdit[key].content;
                            if(fileContent.length > 0){
                                for(let file of fileContent){
                                    htmlRequest += '<br> ' + file.name;
                                }
                            }
                            htmlRequest += '</td></tr>';
                        }else{
                            // không thay đổi mô tả nội dung bài viết check thay đổi file
                            if(fileContent.length > 0){
                                for(let [i, file] of fileContent.entries()){
                                    if(i == 0){
                                        htmlRequest += '<tr><td>Nội dung bài viết:</td> <td>' + file.name;
                                    }else if(i == (fileContent.length - 1)){
                                        htmlRequest += '<br> ' + file.name + '</td></tr>';
                                    }else{
                                        htmlRequest += '<br> ' + file.name;
                                    }
                                }
                            }
                        } 
                        // có thay đổi mô tả giấy phép quảng cáo
                        if(requestEdit[key].asd){
                            htmlRequest += '<tr><td>Giấy phép quảng cáo:</td> <td>' + requestEdit[key].asd;
                            if(fileAsd.length > 0){
                                for(let file of fileAsd){
                                    htmlRequest += '<br> ' + file.name;
                                }
                            }
                            htmlRequest += '</td></tr>';
                        }else{
                            // không thay đổi mô tả giấy phép quảng cáo check thay đổi file
                            if(fileAsd.length > 0){
                                for(let [i, file] of fileAsd.entries()){
                                    if(i == 0){
                                        htmlRequest += '<tr><td>Giấy phép quảng cáo:</td> <td>' + file.name;
                                    }else if(i == (fileAsd.length - 1)){
                                        htmlRequest += '<br> ' + file.name + '</td></tr>';
                                    }else{
                                        htmlRequest += '<br> ' + file.name;
                                    }
                                }
                            }
                        }
                        break;
                    default: break;
                }
                switch(key){
                    case 'format':
                    case 'post_type': 
                    case 'channel':  htmlRequest += '<td>'+ requestEdit[key].text_new +'</td></tr>'; break;
                    case 'explain': break;
                    default: htmlRequest += '<td>'+ requestEdit[key].new +'</td></tr>'; break;
                }
            }
        }
    }

    if(isCheckFileArray){
        let fileContent = fileInfos.filter(i => (i.type == 2 && i.isNew == true));
        let fileAsd = fileInfos.filter(i => (i.type == 1 && i.isNew == true));
        if(fileContent.length > 0){
            for(let [i, file] of fileContent.entries()){
                if(i == 0){
                    htmlRequest += '<tr><td>Nội dung bài viết:</td> <td>' + file.name;
                }else if(i == (fileContent.length - 1)){
                    htmlRequest += '<br> ' + file.name + '</td></tr>';
                }else{
                    htmlRequest += '<br> ' + file.name;
                }
            }
        }
        if(fileAsd.length > 0){
            for(let [i, file] of fileAsd.entries()){
                if(i == 0){
                    htmlRequest += '<tr><td>Giấy phép quảng cáo:</td> <td>' + file.name;
                }else if(i == (fileAsd.length - 1)){
                    htmlRequest += '<br> ' + file.name + '</td></tr>';
                }else{
                    htmlRequest += '<br> ' + file.name;
                }
            }
        }
    }
    if(htmlRequest.length == 0){
        $('#modal-cf-luu-bai-viet-yeu-cau-wapper').hide()
    }else{
        $('#modal-cf-luu-bai-viet-yeu-cau-wapper').show();
        $('#modal-cf-luu-bai-viet-yeu-cau').html(htmlRequest);
    }
    return {htmlAllowLength: htmlAllow.length, htmlRequestLength: htmlRequest.length};
}

function getDetailRequestEdit(id){
    try {
        if(id){
            $.ajax({
                type: 'GET',
                url: '/article/request-edit-detail?id=' + id +'&type='+ dataArticle.type,
                success: function(result) {
                    if (result.success && result.data) {
                        $("#modal-chi-tiet-yeu-cau-sua").find('.table-responsive-inner').html(result.data);
                        $("#modal-chi-tiet-yeu-cau-sua").find('.modal-header').html(
                            `<h3 class="modal-title fs-16px text-uppercase mb-0">Yêu cầu sửa `+ result.id_count +` -</h3>
                            <span class="badge badge-code bg-primary-light text-primary fs-16px">`+ dataArticle.id_request +`</span>
                            ` + result.created_at + (result.isFinish && result.isFinish == 1 ? 
                                `<span class="badge badge-da-duyet">Đã hoàn thành</span>` : `<span class="badge badge-gui-duyet">Đã gửi</span>`)
                        );
                    
                        if(result.isFinish && result.isFinish == 1){
                            $('#modal-chi-tiet-yeu-cau-sua').find("#btn-detail-request-edit").html(`
                                <div class="col-sm-6 col-md-auto">
                                    <button class="btn btn-cancel box-btn w-100 text-uppercase" type="button" data-bs-dismiss="modal">Đóng</button>
                                </div>`);
                        }else{
                            if(result.created_by){
                                $('#modal-chi-tiet-yeu-cau-sua').find("#btn-detail-request-edit").html(`
                                    <div class="col-sm-6 col-md-auto">
                                        <button class="btn btn-danger box-btn w-100 text-uppercase" type="button" onclick="huyYeuCauSua(`+ id +`)">
                                            <svg class="iconsvg-trash flex-shrink-0 fs-16px me-2">
                                                <use xlink:href="/public/content/images/sprite.svg#trash"></use>
                                            </svg>Huỷ yêu cầu sửa
                                        </button>
                                    </div>    
                                    <div class="col-sm-6 col-md-auto">
                                        <button class="btn btn-cancel box-btn w-100 text-uppercase" type="button" data-bs-dismiss="modal">Đóng</button>
                                    </div>`);
                            }else{
                                $('#modal-chi-tiet-yeu-cau-sua').find("#btn-detail-request-edit").html(`  
                                    <div class="col-sm-6 col-md-auto">
                                        <button class="btn btn-cancel box-btn w-100 text-uppercase" type="button" data-bs-dismiss="modal">Đóng</button>
                                    </div>`);
                            }
                        }
                        $('#modal-chi-tiet-yeu-cau-sua').modal('show');
                    } else {
                        displayError(result.message);
                    }
                },
                error: function(jqXHR, exception) {
                    ajax_call_error(jqXHR, exception);
                }
            });
        }
       
    } catch (error) {
        console.log("getDetailRequestEdit", error);
    }
}

function huyYeuCauSua(id){
    try {
        console.log("huyYeuCauSua", id);
    } catch (error) {
        
    }
}

function clearInput(id){
    $(id).val('');
    console.log("clearInput", id);
    let idSplit = id.split('_');
    let prefix = idSplit[0].replace('#', '');
    switch( id ) {
        case '#art_title':
        case '#sendreview_title':    
            if(dataArticle.requestEdit && dataArticle.requestEdit.title){
                delete dataArticle.requestEdit.title.new;
                delete dataArticle.requestEdit.title.stt;
            }
            checkUnlockButton(prefix);
            checkRequestEdit(prefix, 'title');
            break;
        case '#sendreview_description':
        case '#art_description':
            checkUnlockButton(prefix);
            checkRequestEdit(prefix, 'description');
            break;
        default: break;
    }
}

function showContactSupportDropdownSelect2(type){
    if(type == 'loai_bai'){
        $('#contact_support').html('Vui lòng liên hệ vận hành để hỗ trợ sửa bài theo loại bài bạn muốn!')
    }
    $('#modal-contact-support-dropdown-select2').modal('show');
    $('#art_channel_id, #art_format_id, #sendreview_channel_id, #sendreview_format_id').select2('close');
}