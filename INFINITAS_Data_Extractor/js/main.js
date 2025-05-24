$(document).ready(function () {
  $('.tab-link').on('click', function (e) {
    e.preventDefault();
    $('.tab-link').removeClass('active');
    $(this).addClass('active');
    const type = $(this).data('type');
    loadData(type);
  });

  loadData("DP"); // 初期ロード
});
