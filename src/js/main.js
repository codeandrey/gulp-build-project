$(document).ready(function(){
	//svg4everybody();
	(function() {

	"use strict";

	var toggles = document.querySelectorAll(".menu__hamburger");
	for (var i = toggles.length - 1; i >= 0; i--) {
		var toggle = toggles[i];
		toggleHandler(toggle);
	};

	function toggleHandler(toggle) {
		toggle.addEventListener( "click", function(e) {
			e.preventDefault();
			(this.classList.contains("is-active") === true) ? this.classList.remove("is-active") : this.classList.add("is-active");
		});
	}
	
})();
/*
	$.pixlayout({
		src: "/picxel_layout/frontpage.jpg",
		opacity: 0.8,
		top: 0,
		center: true,
		clip: true,
		show: true
	}, ".wrapper");

*/
	$(".fa-bars").click(function(){
		if($(".menu__bars").css("display")=="block"){
			$(".menu__bars").css("display", "none");
		}
		else{
			$(".menu__bars").css("display", "block");
		}
	})
	$('.slider__top').slick({
        	
    	prevArrow: ".arrow__right", 
        	nextArrow: ".arrow__left"
        	});
	
	/*$('.grid').masonry({
  		gutter: 30,
  		// options...
  		itemSelector: '.grid-item',
  		columnWidth: 270
	});*/
});