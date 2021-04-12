chrome.runtime.sendMessage({ operation: 'get_pass' });
chrome.runtime.sendMessage({ operation: 'get_state_guard' });
let state_settings = 0;
let state_guard = 0;
let ui_guard_state = 0;
let pass = '0000';

chrome.runtime.onMessage.addListener(function (request) {
  if (request.operation === 'received_pass') {
    pass = request.pass;
  } else if (request.operation === 'received_state') {
    state_guard = request.status;
    if (state_guard === 1) {
      $('#toggle--push').prop('checked', true);
    }
  }
});

$('.settings').click(function () {
  if (state_guard === 0) {
    if (state_settings === 0) {
      $('.reset-pass-text').fadeIn(500);
      visible(true);
      state_settings = 1;
    } else {
      $('.reset-pass-text').fadeOut(500);
      unvisible(true);
      state_settings = 0;
    }
  } else {
    $('.toggle--push .toggle--checkbox:checked + .toggle--btn').css(
      'box-shadow',
      '0 2px 5px 0px #ff0000, 0 15px 20px 0px transparent',
    );
    setTimeout(function () {
      $('.toggle--push .toggle--checkbox:checked + .toggle--btn').css(
        'box-shadow',
        '0 2px 5px 0px gray, 0 15px 20px 0px transparent',
      );
    }, 2500);
  }
});

$('#button_pass').on('click', function () {
  var $inp = $('#input_pass');
  $inp.attr('type') === 'password' ? $inp.attr('type', 'text') : $inp.attr('type', 'password');
});

$('.toggle--btn').click(function () {
  if (pass === '0000') {
    if (state_guard === 1) {
      guard_button(false);
    }
    if (state_settings === 0) {
      $('.reset-pass-text').fadeIn(500);
      visible(true);
      state_settings = 1;
    } else {
      $('.reset-pass-text').fadeOut(500);
      unvisible(true);
      state_settings = 0;
    }
    $('.toggle--push .toggle--checkbox:checked + .toggle--btn').css(
      'box-shadow',
      '0 2px 5px 0px #ff0000, 0 15px 20px 0px transparent',
    );
    $('.reset-pass-text').css('color', 'red');
    setTimeout(function () {
      $('.toggle--push .toggle--checkbox:checked + .toggle--btn').css(
        'box-shadow',
        '0 2px 5px 0px gray, 0 15px 20px 0px transparent',
      );
      $('.reset-pass-text').css('color', 'black');
    }, 2500);
  } else {
    if (state_guard === 0) {
      guard_button(true);
      if (state_settings === 1) {
        $('.reset-pass-text').fadeOut(500);
        unvisible(true);
        state_settings = 0;
      }
    } else {
      if (state_guard === 1 && ui_guard_state === 0) {
        ui_guard(true);
        visible();
      } else {
        $('.pass-text').css('color', 'red');
        $('#prv').css('color', 'red');
        setTimeout(() => {
          $('.pass-text').css('color', '#212529');
          $('#prv').css('color', '#212529');
        }, 3000);
      }
    }
  }
});

$('#save_pass').click(function () {
  if (state_guard === 1 && ui_guard_state === 1) {
    let user_pass = $('#input_pass').val().toString();
    console.log('PASS:', pass);
    console.log('user_pass', user_pass);
    if (user_pass === pass) {
      guard_button(false);
      ui_guard(false);
      unvisible();
    } else {
      $('#prv').css('color', 'red');
      setTimeout(() => {
        $('#prv').css('color', '#212529');
      }, 3000);
    }
  } else if (state_settings === 1) {
    let user_pass = $('#input_pass').val();
    let len = user_pass.length;
    user_pass = user_pass.replace(/\(/g, '');
    let len_after = user_pass.length;
    if (len < 1 || len !== len_after || len > 64) {
      $('#bad-pass-text').show();
    } else {
      pass = user_pass.toString();
      chrome.runtime.sendMessage({ operation: 'set_pass', password: pass });
      $('.reset-pass-text').fadeOut(500);
      unvisible(true);
      state_settings = 0;
    }
  }
});

function visible(preload) {
  if (preload === true) {
    $('.settings').css('transform', 'rotate(100deg)');
  }

  $('password').fadeIn(500);
  $('#pass').animate({ height: '74px' }, 500);
}

function unvisible(preload) {
  if (preload === true) {
    $('.settings').css('transform', 'rotate(0deg)');
  }
  let bad_status = $('#bad-pass-text').css('display');
  if (bad_status == 'block') {
    $('#bad-pass-text').hide();
  }

  $('#input_pass').val('');
  $('password').fadeOut(250);
  $('#pass').animate({ height: '0px' }, 500);
}

function guard_button(status) {
  if (status === false) {
    state_guard = 0;
    $('#toggle--push').prop('checked', false);
  } else {
    state_guard = 1;
    $('#toggle--push').prop('checked', true);
  }
  chrome.runtime.sendMessage({ operation: 'set_state_guard', value: state_guard });
}

function ui_guard(status) {
  if (status === false) {
    ui_guard_state = 0;
    $('.pass-text').fadeOut(500);
  } else {
    ui_guard_state = 1;
    $('.pass-text').fadeIn(500);
  }
}
