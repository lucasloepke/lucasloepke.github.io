$(document).ready(function() {

	// Creates a smooth scrolling effect to jump to different tags
	$('a[href^="#"]').on('click',function(e) {
	    e.preventDefault();

	    var target = this.hash,
	    $target = $(target);

	    $('html, body').stop().animate({
	        'scrollTop': $target.offset().top
	    }, 900, 'swing', function () {
	        window.location.hash = target;
	    });
	});

	// Fades in elements as the user scrolls
	$(window).scroll(function() {
		$('.fadeIn').each(function(i){
			var middle_of_object = $(this).position().top + $(this).outerHeight() / 3;
			var bottom_of_window = $(window).scrollTop() + $(window).height();
				   
			if(bottom_of_window > middle_of_object) {
				$(this).animate({'opacity':'1'}, 1000);	  
			}  
		}); 
	});

	// Changes the jumbotron picture to NASA's Astronomy Picture of the Day on click
	$('.jumbotron').toggle( 
		function() {
			$.ajax("https://api.nasa.gov/planetary/apod?hd=False&api_key=ffNevQSLNePBIdPvXmyuJHsmjnnAi4jYvWJGELsK", {
	    		success: function (data) {
	    			if (data.media_type == "video") {
	    				$(".jumbotron").css("background", "url(Images/galaxy.jpg)");
	      				$(".jumbotron").css("background-size", "cover");
	    			}
	    			else {
	      				$(".jumbotron").css("background", "url(" + data.url + ")");
	      				$(".jumbotron").css("background-size", "cover");
	      			}
	    		}
	    	});
		},
		function() {
			$(".jumbotron").css("position", "relative");
			$(".jumbotron").css("background", "#000 url(Images/ocean.jpg) center center");
			$(".jumbotron").css("width", "100%");
			$(".jumbotron").css("height", "100vh");
			$(".jumbotron").css("background-size", "cover");
			$(".jumbotron").css("overflow", "hidden");
		}
	);

    // Shows course descriptions when clicking the title
    $(function() {
    	$('#descriptions').find('.toggle').click(function() {
      	$(this).next().slideToggle('fast');
      	$(".content").not($(this).next()).slideUp('fast');
	});
	
	// TODO lazy load images
  });
});
