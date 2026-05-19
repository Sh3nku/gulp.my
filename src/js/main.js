let popup_xhr,
    popupIsOpen = false;

function addLoaderOnButton( button ) {
    button.addClass( '_loader' ).prop( 'disabled', true );
}

function removeLoaderOnButton( button ) {
    button.removeClass( '_loader' ).prop( 'disabled', false );
}

function popupOpen ( array ) {
    let overlay = $( '.popup__overlay' ),
        timeout = 0;

    console.log( array );

    if ( !overlay.length ) {
        $( 'body' ).addClass( '_overflow' ).append(`
            <div class="popup__overlay">
                <div class="popup">
                    <div class="popup__close"></div>
                    <div class="popup__content"></div>
                </div>
            </div>
        `);

        overlay = $( '.popup__overlay' );
        timeout = 10;
    }

    let popup = $( '.popup' ),
        content = $( '.popup__content' );

    setTimeout(function () {
        overlay.addClass( '_show' );
    }, timeout);

    if ( array.url ) {
        overlay.addClass( '_loader' );

        popup_xhr = $.ajax({
            url: array.url,
            type: 'POST',
            data: array.data,
            async: false,
            success: function( data ) {
                let html = data;

                if ( array.hashtag ) {
                    html = $( data ).find( '#' + array.hashtag ).html();
                    if ( html === undefined ) html = $( data ).filter( '#' + array.hashtag ).html();
                }

                overlay.removeClass( '_loader' );
                content.html( html );

                content[0].querySelectorAll( 'input[type=tel]' ).forEach( e => IMask( e, {
                    mask: '+{7} ( 000 ) 000-00-00'
                }));
            }
        });
    } else {
        content.html( array.content );
    }

    let popupHeight = popup.height() + 64,
        windowHeight = $( window ).height(),
        marginTop = 0;

    if ( popupHeight < windowHeight ) {
        marginTop = ( windowHeight - popupHeight ) / 2
    }

    popup.css( 'margin-top', marginTop );

    setTimeout(function () {
        popup.addClass( '_show' );
    }, timeout);

    popupIsOpen = true;
}

function popupClose () {
    $( 'body' ).removeClass( '_overflow' );
    $( '.popup__overlay' ).remove();
    popupIsOpen = false;
}

function tabs () {
    $('.tabs-button input').each( function ( k, item ) {
        let tabId = $( item ).attr( 'id' ),
            target = $( '[data-tab="' + tabId + '"]' );

        if ( $( item ).prop( 'checked' ) === true ) {
            target.show();
        } else {
            target.hide();
        }
    });
}

function validateForm ( obj ) {
    let target = obj.find( 'input[type=text], input[type=tel], input[type=email], input[type=password], input[type=checkbox], input[type=file], textarea, select' ),
        validate = true;

    target.each( function ( k, v ) {
        let input = $( v ),
            item = input.closest( '.form__input' ),
            errorText = input.data( 'error-text' ) !== undefined ? input.data( 'error-text' ) : 'Ошибка';

        if (
            (
                input.prop( 'required' ) === true
                && (
                    !input.val()
                    || ( input.attr( 'type' ) === 'checkbox' && input.prop( 'checked' ) === false )
                )
            ) || (
                input.val()
                && (
                    ( input.attr( 'type' ) === 'tel' && input.val().replace(/\D/g,'').length !== 11 )
                    || ( input.attr( 'type' ) === 'email' && !input.val().toLowerCase().match( /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ ) )
                )
            )
        ) {
            if (
                input.attr( 'type' ) === 'checkbox'
                && (
                    obj.find( 'input[type=checkbox][name="' + input.attr( 'name' ) + '"]:checked').length
                    || obj.find( 'input[type=checkbox][name="' + input.attr( 'name' ) + '"] ~ .form__input-error').length
                )
            ) return;

            item.addClass( '_error' );

            item.append( '<span class="form__input-error">' + errorText + '</span>' );

            validate = false;
        }
    });

    return validate;
}

$( function () {
    tabs();

    var swiper = new Swiper(".mySwiper", {
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
    });

    $( 'input[type=file]' ).dkDropZone({
        'title': 'Загрузите файл',
        'description': 'Для загрузки файла нажмите или перетащите файл в область'
    });

    document.querySelectorAll( 'input[type=tel]' ).forEach( e => IMask( e, {
        mask: '+{7} ( 000 ) 000-00-00'
    }));

    $( 'table' ).wrap( '<div class="table-wrapper"></div>' );

    $( document ).on( 'click', '.js-popup', function ( e ) {
        e.preventDefault();

        let target = $( this ).attr( 'href' ),
            blockTarget;

        [ url, blockTarget ] = target.split( '#' );

        if ( url ) {
            popupOpen({
                'url': url,
                'hashtag': blockTarget
            });
        } else {
            popupOpen({
                'content': $( '#' + blockTarget ).html()
            });
        }
    });

    $( document ).on( 'click', '.popup__close', function () {
        popupClose();
    });

    $( document ).on( 'keydown', function ( e ) {
        if ( e.key === 'Escape' && popupIsOpen ) {
            popupClose()
        }
    });

    $( document ).on( 'mouseup', function ( e ) {
        let popup = $( '.popup' ),
            overlay = popup.parent( '.popup__overlay' );

        if (
            overlay.hasClass( '_show' )
            && !popup.is( e.target )
            && popup.has( e.target ).length === 0
        ) {
            if ( overlay.hasClass( '_loader' ) && popup_xhr ) popup_xhr.abort();
            popupClose();
        }
    });

    $( document ).on( 'submit', 'form[novalidate]', function ( e ) {
        e.preventDefault();

        if ( !validateForm( $( this ) ) ) return false;

        let form = $( this ),
            action = form.attr( 'action' ),
            array = new FormData( this );

        $.ajax({
            url: action,
            type: 'POST',
            data: array,
            processData: false,
            contentType: false,

            success: function( data ) {
                let answer = JSON.parse( data );

                console.log( answer );

                if ( answer.status === 'success' ) {

                    if ( answer.data.popup ) {
                        popupOpen({
                            'content': answer.data.popup.content
                        })
                    }

                } else if ( answer.status === 'error' ) {
                    console.log('Ошибочка');
                }
            }
        });
    });

    $( document ).on( 'change', 'input[type=checkbox]', function () {
        let name = $( this ).attr( 'name' );
        $( 'input[name="' + name + '"]' ).closest( '.form__input, .inputs' ).removeClass( '_error' ).children( '.form__input-error' ).remove();
    });

    $( document ).on( 'focusin', 'input[type=text], input[type=tel], input[type=email]', function () {
        $( this ).closest( '.form__input, .inputs' ).removeClass( '_error' ).children( '.form__input-error' ).remove();
    });

    // Аккордеон
    $( document ).on( 'click', '.js-accordion', function () {
        let accordion = $( this ).closest( '.accordion' ),
            accordionBody = accordion.children( '.accordion__body' ),
            heightContent = accordionBody.children( '.accordion__inner' ).outerHeight();

        accordionBody.css( 'height', heightContent );

        setTimeout( function () {
            if ( accordion.hasClass( '_open' ) ) {
                accordion.removeClass( '_open' );
                accordionBody.css( 'height', 0 );
            } else {
                accordion.addClass( '_open' );
            }
        }, 1 )
    });

    // Табы
    $( document ).on( 'change', '.tabs-button input', function () {
        tabs();
    });

    //Видео
    $( document ).on( 'click', '.js-play-video', function () {
        let currentVideoButton = $( this ),
            currentVideoCard = currentVideoButton.closest( '.video' ),
            currentVideo = currentVideoButton.next( 'video' )[0];

        $( 'video' ).each( function () {
            let video = $( this )[0],
                videoCard = $( this ).closest( '.video' ),
                videoButton = $( this ).next( '.video__action' )

            if ( video === currentVideo ) return;

            video.pause();
            video.currentTime = 0;
            videoCard.removeClass( '_played' );
        });

        if ( !currentVideo.paused && !currentVideo.ended ) {
            currentVideo.pause();
            currentVideoCard.removeClass( '_played' );
        } else {
            currentVideo.play();
            currentVideoCard.addClass( '_played' );
        }
    });

    // Показать ещё
    $( document ).on( 'click', '.js-show-more', function ( e ) {
        e.preventDefault();

        let id = $( this ).data( 'target' ),
            href = $( this ).attr( 'href' ),
            paginationWrapper = $( this ).parent( 'div' );

        addLoaderOnButton( $( this ) );

        $.ajax({
            url: href,
            type: 'POST',

            success: function( data ) {
                paginationWrapper.remove();
                $( '#' + id ).append( $( data ).find( '#' + id ).html() );
            }
        });
    });
});