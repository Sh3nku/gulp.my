<? if ( isset( $_GET['uploadfiles'] ) ) {
    $answer = [];
    $directory = '/files/upload/';

    $dir = $_SERVER['DOCUMENT_ROOT'] . $directory;

    if ( !is_dir( $dir ) ) mkdir( $dir, 0755 );

    $all_files = glob( $dir . '*' );

    if ( count( $all_files ) > 0 ) {
        foreach ( $all_files as $file ) {
            if ( file_exists( $file ) AND date( 'Y-m-d H:i:s', strtotime( '-1 day' ) ) >= date( 'Y-m-d H:i:s', filectime( $file ) ) ) {
                unlink( $file );
            }
        }
    }

    foreach ( $_FILES as $arFile ) {
        $file_name = preg_replace( '/\s/', '_', $arFile['name'] );

        $answer[] = $file_name;

        if ( move_uploaded_file( $arFile['tmp_name'], $dir . iconv('utf-8', 'windows-1251', $file_name) ) ) {

            $answer['data'] = array(
                'path' => $directory . $file_name,
                'picture' => $arFile['type'] === 'image/jpeg' || $arFile['type'] === 'image/png' ? $directory . $file_name : ''
            );
        }
    }

    echo json_encode( $answer, JSON_UNESCAPED_UNICODE );
}