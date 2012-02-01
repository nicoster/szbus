(function(){
	
	$('.cbpair input[type="checkbox"]').click(function(){
		if ($('.cbpair input[type="checkbox"]:checked').length){
			$('input[type="submit"]').removeAttr('disabled');
		}
		else{
			$('input[type="submit"]').attr('disabled','disabled');
		}
	});
	
	$('#addfav').click(function(e) {
		e.preventDefault();

	  var buses = [], params = {};
		$('.cbpair input[type="checkbox"]:checked').each(function(index, bus){
			buses.push($(bus).val());
		});
//		alert(buses);
		params = {'buses': buses, 'stop': $('form').attr('id')};

	  $.post('/fav', params, function(data) {
	  });
	});

	$('#refresh').click(function(e){
		e.preventDefault();
		
		$(this).text('Refreshing..');
		$('.favstop').each(function(index, favstop){
			$.get('/update/' + $(favstop).attr('id') + '.json', function(data){
				var buses = ''; 
				data.buses.forEach(function(bus){
					buses += '<li>' + bus.name + ' - ' + bus.hop + '</li>';
				});
				$('#' + data.stop.code).html('<h3>' + data.stop.name + '</h3>' + buses);
				$('#refresh').text('Refresh');
			});
		});
	}).click();
	
})();
