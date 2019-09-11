$(document).ready(function() {
	
	$(document).on('click','.m-menu',function(){
		$('.dashnav').toggleClass('open');
	});
	$(document).on('click','.opentool',function(event){
		$('.tooldropdown').toggleClass('open');
		event.stopPropagation();
		$(document).on('click',function(){$('.tooldropdown').removeClass('open');});
	});
	$(document).on('click','.openfilter',function(event){
		$('.filterdropdown').toggleClass('open');
		event.stopPropagation();
		$(document).on('click',function(){$('.filterdropdown').removeClass('open');});
	});
	$(document).on('click','.tooldropdown a',function(){
		var textimg = $(this).html();
		$('.opentool').html(textimg);
		//$('.tooldropdown').removeClass('open');
	});
	
	
	
	if($(window).width() < 768){
		$(document).on('click','.dash-footer h3',function(){
			$(this).toggleClass('open').next('ul').slideToggle();
		});
	}
		$(".backtotop").click(function(event) {
			event.preventDefault();
			$("html, body").animate({ scrollTop: 0 }, "slow");
			return false;
		});


});
new WOW().init();

