//Form gửi duyệt đăng
$('#sendreview_layout').click(function(e) {
    e.preventDefault();
    var linklayout = $("#" + this.id).val();
    if(linklayout.length > 0){
        window.open(linklayout, '_blank')
    }
});

$("#sendreview_site_id").change(evt => {
    $('#sendreview_format_id, #sendreview_channel_id').prop("disabled", false);
    loadDataWhenSiteChange('sendreview');
    let url_demo = "<%=article.url_demo%>";
    if(url_demo.length > 0){
        let site   = $("#sendreview_site_id :selected").data('domaingroup');
        let layout = window.location.protocol + '//' + window.location.hostname + '/preview/pc_view/' + site + "/" + book_id + "/" + (dataArticle.versionContent ? dataArticle.versionContent : 1);
        $('#sendreview_layout').val(layout);
    }
    $('#sendreview_price').val('');
});

$('#sendreview_format_id').change(evt => {
    let fm_price = isNaN(parseInt($('#' + evt.target.id + ' option:selected').data('price'))) ? null : parseInt($('#' + evt.target.id + ' option:selected').data('price'));
    $('#sendreview_price').val(fm_price ? numberFormat.format(fm_price) : '');
    checkUnlockButton('sendreview');
    checkRequestEdit( 'sendreview', 'format');

     // Bài ở trạng thái đã duyệt tải lại danh sách bookiing
     if(dataArticle.search_status == 2){
        getListBookingForPublish('sendreview');
    }
});

$('#sendreview_format_id, #sendreview_channel_id, #sendreview_time_from').on('select2:clear', function (evt) {
    checkUnlockButton('sendreview');
});

$('#sendreview_channel_id').on('select2:select', function(evt) {
    if(dataArticle.status == -2) saveArticle('sendreview', 0, 1);
    // check disable nut gui duyet bai trang thai da duyet
    if(dataArticle.search_status == 2){
        checkUnlockButton('sendreview');
    }
    checkRequestEdit( 'sendreview', 'channel');

     // Bài ở trạng thái đã duyệt tải lại danh sách bookiing
     if(dataArticle.search_status == 2){
        getListBookingForPublish('sendreview');
    }
});
$('#sendreview_time_from').on('select2:select', function(evt) {
    checkRequestEdit( 'sendreview', 'time_from');
});
$('#sendreview_time_from').on('select2:clear', function(evt) {
    checkRequestEdit( 'sendreview', 'time_from');
});
$('#sendreview_book_date, #sendreview_post_type, #sendreview_title, #sendreview_description').change(evt => {
    checkUnlockButton('sendreview');
    checkRequestEdit( 'sendreview', evt.target.id.slice(evt.target.id.indexOf('_') + 1));
});

//check disable nut gui duyet bai trang thai da duyet
$('#list_content textarea[name="request_edit_file_art"], #list_ads_license textarea[name="request_edit_file_art"]').change(evt => {
    if(dataArticle.search_status == 2){
        checkUnlockButton('art');
    }
});

$('#list_content textarea[name="request_edit_file_sendreview"], #list_ads_license_review textarea[name="request_edit_file_sendreview"]').change(evt => {
    if(dataArticle.search_status == 2){
        checkUnlockButton('sendreview');
    }
});

$('#list_content textarea[name="request_edit_file_sendreview"]').change(evt => {
    checkRequestEdit( 'sendreview', 'explainContent');
});

$('#list_ads_license_review textarea[name="request_edit_file_sendreview"]').change(evt => {
    checkRequestEdit( 'sendreview', 'explainAds');
});

$('#list_content textarea[name="request_edit_file_art"]').change(evt => {
    checkRequestEdit( 'art', 'explainContent');
});

$('#list_ads_license textarea[name="request_edit_file_art"]').change(evt => {
    checkRequestEdit( 'art', 'explainAds');
});

$("#art_channel_id, #art_format_id, #sendreview_channel_id, #sendreview_format_id").select2({
    templateResult: fomatTemplateSelect2,
    escapeMarkup: function (m) { return m; }
})

$("#art_site_id").change(evt => {
    $('#art_format_id, #art_channel_id').prop("disabled", false);
    loadDataWhenSiteChange('art');
    $('#art_price').val('');
});

$('#art_format_id, #art_channel_id, #art_time_from').on('select2:clear', function (evt) {
    checkUnlockButton('art');
});

$('#art_format_id').change(evt => {
    let fm_price = isNaN(parseInt($('#' + evt.target.id + ' option:selected').data('price'))) ? null : parseInt($('#' + evt.target.id + ' option:selected').data('price'));
    $('#art_price').val(fm_price ? numberFormat.format(fm_price) : '');
    checkUnlockButton('art');
    checkRequestEdit( 'art', 'format');
    // Bài ở trạng thái đã duyệt tải lại danh sách bookiing
    if(dataArticle.search_status == 2){
        getListBookingForPublish('art');
    }
});

$('#art_channel_id').on('select2:select', function(evt) {
    if(dataArticle.status == -2) saveArticle('art', 0, 1);
    // check disable nut gui duyet bai trang thai da duyet
    if(dataArticle.search_status == 2){
        checkUnlockButton('art');
    }
    checkRequestEdit( 'art', 'channel');
    // Bài ở trạng thái đã duyệt tải lại danh sách bookiing
    if(dataArticle.search_status == 2){
        getListBookingForPublish('art');
    }
});
$('#art_time_from').on('select2:select', function(evt) {
    checkRequestEdit( 'art', 'time_from');
});
$('#art_time_from').on('select2:clear', function(evt) {
    checkRequestEdit( 'art', 'time_from');
});
$('#art_book_date, #art_post_type, #art_title, #art_description').change(evt => {
    checkUnlockButton('art');
    checkRequestEdit( 'art', evt.target.id.slice(evt.target.id.indexOf('_') + 1));
});

$("#file_input_content").on('change', function(e) {
    let getFile = addFiletoDataTranfer(this.files, 2);
    this.files = dt_content.files;
    initHtmlFile(getFile.arrFileUpload, 2, getFile.nameFileErr);
    dataArticle.isSave = false;
    if(dataArticle.type == 2){
        checkUnlockButton('art');
    }
    setTimeout(()=>{
      dataArticle.isSave = true;
    });
});

$("#file_input_asd").on('change', function(e) {
    let getFile = addFiletoDataTranfer(this.files, 1);
    this.files = dt_asd.files;
    initHtmlFile(getFile.arrFileUpload, 1, getFile.nameFileErr);
});

$("#file_input_asd_review").on('change', function(e) {
    let getFile = addFiletoDataTranfer(this.files, 1);
    this.files = dt_asd.files;
    initHtmlFile(getFile.arrFileUpload, 1, getFile.nameFileErr);
});

$("#editor_site_id").change(evt => {
  $('#editor_format_id, #editor_channel_id').prop("disabled", false);
  loadDataWhenSiteChange('editor');
  $("#sendreview_site_id").val($("#editor_site_id").val()).trigger('change');
});

$('#editor_format_id').change(evt => {
  if(dataArticle.status == -2) saveArticle('editor', 0, 1);
});

$('#editor_channel_id').on('select2:select', function(evt) {
  if(dataArticle.status == -2) saveArticle('editor', 0, 1);
});

$('#art_book_id').change(function () {
    selectBookingArticle('art', this);
});

$('#sendreview_book_id').change(function () {
    selectBookingArticle('sendreview', this);
});

$('#article_form #art_format_id,#article_form #art_time_from').change(function () {
    chkArticleLimit('art', this);
});
$('#article_form #sendreview_format_id,#article_form #sendreview_time_from').change(function () {
    chkArticleLimit('sendreview', this);
});

$('#article_form #art_book_date,#article_form #art_channel_id').change(function () {
    getArticleTimeFrom('art', true);
});

$('#article_form #sendreview_book_date,#article_form #sendreview_channel_id').change(function () {
    getArticleTimeFrom('sendreview', true);
});

$("#art_book_date,#sendreview_book_date").flatpickr({
    dateFormat: "d-m-Y",
    minDate: "today",
    maxDate: new Date().fp_incr(29)
});

$(document).ready(function() {
    if (dataArticle.status >= 0) {
        $("#art_site_id").prop("disabled", true);
        $("#sendreview_site_id").prop("disabled", true);
        $("#editor_site_id").prop("disabled", true);
    }

    if(dataArticle.page == 'edit') {
        if(dataArticle.type == 1){
            $('#send_file').hide();
            $('#dung_bai_tab').hide();
            $('#gui_duyet_dung_bai').show();
        }else{
            $('#dung_bai_tab ul[role="tablist"]').hide();
            $('#gui_duyet_dung_bai').hide();
            $('#dung_bai_tab').hide();
            $('#send_file').show();
        }
        dataArticle.isSave = false;
        checkUnlockButton(dataArticle.type == 1 ? 'sendreview' : 'art');
        setTimeout(() =>{
            dataArticle.isSave = true;
        }, 1000);
    }else {
        $('#gui_duyet_dung_bai').hide();
    }
    dropFileUpload();

    if(dataArticle.page == 'create'){
        //Tai Editor
        getEditorToken('#frame_editor', book_id);
    }
    toogleDropFileSelect();
    generateRequestEdit();
    checkEditFile();

    var urlParams       = new URLSearchParams(window.location.search),
        select_book_id  = urlParams.get('booking_id'),
        select_book_id  = isNaN(parseInt(select_book_id)) ? 0 : parseInt(select_book_id);
                
    if (select_book_id > 0){
        $("#article_book_id").val(select_book_id);
        if(dataArticle.type == 1){
            $("#sendreview_book_id").val(select_book_id).change();
        } else if(dataArticle.type == 2){
            $("#art_book_id").val(select_book_id).change();
        }
    }

    if(!$("#sendreview_site_id").val() && !dataArticle.article.site_id){
        $('#sendreview_format_id, #sendreview_channel_id').prop("disabled", true);
    }
    if(!$("#art_site_id").val() && !dataArticle.article.site_id){
        $('#art_format_id, #art_channel_id').prop("disabled", true);
    }
    if(!$("#editor_site_id").val()){
        $('#editor_format_id, #editor_channel_id').prop("disabled", true);
    }
});