( function( $ ) {
    function dropZone ( array ) {
        array.dropzone[0].ondragover = function() {
            array.dropzone.addClass('_hover');
            return false;
        };

        array.dropzone[0].ondragleave = function() {
            array.dropzone.removeClass('_hover');
            return false;
        };

        array.dropzone[0].ondrop = function(event) {
            event.preventDefault();
            array.dropzone.removeClass('_hover');

            let files = event.dataTransfer.files;

            return uploadFiles({
                'files': files,
                'input': array.input,
                'settings': array.settings,
                'multiple': array.multiple,
                'accept': array.accept
            });
        };
    }

    function uploadFiles ( array ) {
        if ( !array.multiple && array.files.length > 1 ) {
            alert( 'Разрешен только один файл' );
            return false;
        }

        let accept = false,
            dropZone = array.input.closest( '.dk-dropzone' ),
            list = dropZone.children( '.dk-dropzone__list' );

        if ( !array.multiple ) list.html( '' );

        if ( array.accept ) {
            accept = array.accept.split( ',' ).map(
                value => value.trim().replace( '.', '' )
            );
        }

        let dataTransfer  = new DataTransfer();

        $.each( array.files, function( key, value ) {
            let fileSize = value.size,
                fileName = value.name,
                extension = fileName.split( '.' ).pop();

            if ( accept.length && !accept.includes( extension ) )
                return alert( '"' + value.name + '" неподходящее расширение' );

            if ( array.settings.max_file_size && array.settings.max_file_size < fileSize )
                return alert( '"' + value.name + '" слишком большого размера' );

            dataTransfer.items.add( value );

            list.append(createItem({
                'value': value,
                'settings': array.settings,
                'list': list
            }));

            let data = new FormData(),
                item = list.children().last(),
                loader = item.children( '.dk-dropzone__loader' ),
                loaderBar = item.find( '.dk-dropzone__loader-progress' ),
                loaderBlock = item.find( '.dk-dropzone__loader-percent' );

            data.append( key, value );

            $.ajax({
                url: '/dkDropZone.php?uploadfiles',
                type: 'POST',
                data: data,
                cache: false,
                dataType: 'json',
                processData: false,
                contentType: false,

                xhr: function() {
                    let xhr = $.ajaxSettings.xhr();

                    xhr.upload.addEventListener( 'progress', function( evt ) {
                        if ( evt.lengthComputable ) {
                            let percent = Math.ceil( evt.loaded / evt.total * 100 ) + '%';
                            loaderBar.css( 'width', evt.loaded / evt.total * 100 + '%' );
                            loaderBlock.text( percent );
                        }
                    }, false );

                    return xhr;
                },

                success: function( data ) {

                    if ( typeof data.error === 'undefined' ) {
                        if ( data.data.picture ) {
                            item.find( '.dk-dropzone__item-icon' ).html('<img src="' + data.data.picture + '">');
                        }

                        item.prepend('<input type="hidden" name="' + array.input.attr( 'name' ) + '[' + item.data( 'key' ) + '][path]" value="' + data.data.path + '">')

                        loader.remove();
                    } else {
                        console.log('ОШИБКИ ОТВЕТА сервера: ' + data.error );
                    }

                },

                error: function( jqXHR, textStatus ) {
                    console.log('ОШИБКИ AJAX запроса: ' + textStatus );
                }

            });
        });

        array.input[0].files = dataTransfer.files;
    }

    function createItem ( array ) {
        let html = '',
            fileName = array.value.name,
            fileSize = array.value.size,
            picture = '';

        let count = array.list.children().last().data( 'key' );

        if ( count === undefined ) {
            count = 0;
        } else {
            count++;
        }

        if (
            (
                array.value.type === 'image/jpeg' || array.value.type === 'image/png'
            ) && array.value.path
        ) {
            picture = `<img src="` + array.value.path + `">`;
        }

        html = `
            <div class="dk-dropzone__item" data-key="${count}">
                ` + ( ( array.value.id ) ? `<input type="hidden" name="${array.input.attr('name') }[${count}][id]" value="` + array.value.id + `">` : `` ) + `
            
                <div class="dk-dropzone__item-body">
                    <div class="dk-dropzone__item-icon">
                        ${ picture ? picture : '<svg class="svg-icon _file"><use href="/images/file.svg#file"></use></svg>' }
                    </div>
                    
                    <div class="dk-dropzone__item-content">
                        <div class="dk-dropzone__item-name">${fileName}</div>
                        <div class="dk-dropzone__item-description">${formatBytes( fileSize, 2 )}</div>
                    </div>
                    
                    <div class="dk-dropzone__item-remove">
                        <svg class="svg-icon _close">
                            <use href="/images/close.svg#close"></use>
                        </svg>
                    </div>
                </div>
                
                ` + ( !array.value.path ? `
                
                    <div class="dk-dropzone__loader">
                        <div class="dk-dropzone__loader-line">
                            <div class="dk-dropzone__loader-progress" style="width: 0"></div>
                        </div>
                        
                        <div class="dk-dropzone__loader-percent">0%</div>
                    </div>
                
                ` : `` ) + `
            </div>
        `;

        return html;
    }

    function formatBytes(bytes, decimals = 2) {
        if ( !+bytes ) return '0 б';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['б', 'кб', 'мб', 'гб', 'тб'];
        const i = Math.floor( Math.log( bytes ) / Math.log( k ) );
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    let methods = {
        init: function( options ) {
            let defaults = {
                max_file_size: false
            }

            return this.each( function () {
                let defaults = {},
                    settings = $.extend( defaults, options ),
                    input = $( this ),
                    inputId = input.attr( 'id' ),
                    inputName = input.attr( 'name' ),
                    data = input.data(),
                    multiple = input.prop( 'multiple' ),
                    accept = input.prop( 'accept' );

                if ( !inputId ) {
                    input.attr( 'id', inputName );
                    inputId = inputName;
                }

                settings = $.extend( settings, data );

                input.wrap(`
                    <div class="dk-dropzone">
                        <label for="${inputId}">
                            <div class="dk-dropzone__add"></div>
                        </label>
                    </div>
                `);

                let add = input.parent( '.dk-dropzone__add' ),
                    label = add.parent( 'label' );

                dropZone({
                    'dropzone': add,
                    'input': input,
                    'settings': settings,
                    'multiple': multiple,
                    'accept': accept
                });

                add.append(`
                    <div class="dk-dropzone__add-picture">
                        <svg class="svg-icon _dropzone">
                            <use xlink:href="/images/dkDropZone.svg#dkDropZone"></use>
                        </svg>
                    </div>
                    
                    ${ settings.title ? '<div class="dk-dropzone__add-title">' + settings.title + '</div>' : '' }
                    
                    ${ settings.description ? '<div class="dk-dropzone__add-description">' + settings.description + '</div>' : '' }
                    
                    ${ accept || settings.max_file_size ? '<div class="dk-dropzone__add-requirements">' + ( settings.max_file_size ? '<span>Максимальный размер файла: ' + formatBytes( settings.max_file_size, 2 ) + ' </span>' : '' ) + accept + '</div>' : '' }
                `);

                label.after( '<div class="dk-dropzone__list"></div>' );

                let list = label.next();

                if ( settings.value ) {
                    $.each( settings.value, function( key, val ) {
                        list.append(
                            createItem({
                                'value': val,
                                'settings': data,
                                'list': list,
                                'input': input
                            })
                        );
                    });
                }

                input.on( 'change', function() {
                    uploadFiles({
                        'files': this.files,
                        'input': input,
                        'settings': settings,
                        'multiple': multiple,
                        'accept': accept
                    })
                });

                list.on( 'click', '.dk-dropzone__item-remove', function() {
                    let item = $( this ).closest( '.dk-dropzone__item' ),
                        key = item.data( 'key' );

                    item.prepend( '<input type="hidden" name="' + input.attr( 'name' ) + '[' + key + '][delete]" value="Y" />' );
                    item.hide();
                });
            });
        },

        destroy : function( ) {
            console.log( 'destroy' );
        }
    }

    $.fn.dkDropZone = function ( method ) {
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ) );
        } else if ( typeof method === 'object' || !method ) {
            return methods.init.apply( this, arguments );
        } else {
            console.log( 'Method ' + method + ' not found' ); return this;
        }
    }
})( jQuery );