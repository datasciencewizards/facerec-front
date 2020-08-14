/*(function(seconds) {
    var refresh,       
        intvrefresh = function() {
            clearInterval(refresh);
            refresh = setTimeout(function() {
               location.href = location.href;
            }, seconds * 10000);
        };

    $(document).on('keypress click', function() { intvrefresh() });
    intvrefresh();

    console.log("called")

}(30));*/