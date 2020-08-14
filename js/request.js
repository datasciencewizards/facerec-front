//$base_url = 'http://192.168.0.109:5000/'
// $base_url = 'https://facenet.pnbmetlife.com/facenet/'
$base_url = 'https://facerec-back-env.eba-zvmnqwuy.eu-west-1.elasticbeanstalk.com/'

$loading = $('#loading-div')
$recognize_modal = $('#recognize-modal')
$modal = $('#modal')

$data = {}

$(document).ajaxStart(function() {
  $loading.show();
});

$(document).ajaxComplete(function() {
  $loading.hide();
});

/*$(document).ajaxError(function() {
  add_modal_text_and_display($modal, "Some Error Occured, Please Try Again!")
});*/

//make a post request to recognize API
function recognize(b64){
    $.ajax({
      type: "POST",
      url: $base_url + "recognize",
      data: {image : b64},
      dataType: "json",
      success: function(result) {
        console.log(result);
        var i;
        for (i=0;i<result.length;i++){
        if(result[i].message == "recognized"){
          console.log(result[i]);
          $data = result[i];
          add_modal_text_and_display($recognize_modal, "ID: " + result[i].id + "<br>Name: " + result[i].name);
        }else{
          console.log(result[0].message)
          add_modal_text_and_display($modal, result[0].message + ", Please try again!")
        }}
      },
      error : function(request,status,error) {
        console.log(request.responseText);
        console.log(error);
        console.log(status);
      }
    });
}

function mark(id){
    $.ajax({
      type: "POST",
      url: $base_url + "mark",
      data: {'User Id' : id,},
      dataType: "json",
      success: function(result) {
        console.log(result);
        if(result.message == "Success"){
          add_modal_text_and_display_new($modal, "Marked Successfully", true);
        }else{
          add_modal_text_and_display_new($modal, "Please try again!");
        }
        },complete: function(){
        delete_photo_btn.click();
      }
  });
}

function add_modal_text_and_display($modal, $text){
  $display_msg = $modal.find("#display-msg")
  $display_msg.html($text)
  $modal.modal({backdrop: 'static',keyboard: false})
  //setTimeout(function(){
    //$modal.modal('hide')
  //}, 2000);
}

function add_modal_text_and_display_new($modal, $text, $nobtn=false){
  $display_msg = $modal.find("#display-msg")
  $display_msg.html($text)
  if($nobtn==true){
    $('#second-modal-btn').hide();
  }else{
    $('#second-modal-btn').show();
  }
  $modal.modal({backdrop: 'static',keyboard: false})
  setTimeout(function(){
    $modal.modal('hide')
  }, 2000);
}

$('#mark-btn').click(function(){
  mark($data.id);
  setTimeout(function(){
    take_photo_btn.click();
  },5000);
})

$('.close-btn').click(function(){
  delete_photo_btn.click();
  setTimeout(function(){
    take_photo_btn.click();
  },5000);
})
