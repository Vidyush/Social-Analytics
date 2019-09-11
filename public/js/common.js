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
$(document).on('click','.opendialoge',function(){
	$(this).siblings('.customviewmodel, .contentarea').addClass('open');
});
$(document).on('click','.closedialoge',function(){
	$('.customviewmodel,.contentarea').removeClass('open');
});
new WOW().init();

function opentabcontent(tabid){
	if(tabid == '1'){
		$('.ctab1').addClass('active').siblings('.ctab2').removeClass('active');
		$('.part1').addClass('open').siblings('.part2').removeClass('open');
	} else if(tabid == '2'){
		$('.ctab2').addClass('active').siblings('.ctab1').removeClass('active');
		$('.part2').addClass('open').siblings('.part1').removeClass('open');
	}
}