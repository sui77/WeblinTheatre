<?php
ini_set('display_errors', 1);

$url = $_GET['url'] ?? 'http://avatar.zweitgeist.com/gif/006/StatueOfLiberty/config.xml';
$base = preg_replace('/(^.*\/)(.*?)$/si', "$1", $url);
echo '<form><input name="url" style="width:80%" value="' . htmlspecialchars($url) . '"></form><hr>';
$f = json_decode(json_encode(simplexml_load_file ($url)), 1);

foreach ($f['sequence'] as $s) {
    $src = $s['animation']['@attributes']['src'];
    $src = preg_match('/^http:|^https:/', $src) ? $src : $base . $src;

    echo '<img src="' . $src . '">';
    echo json_encode($s['@attributes']);
    echo '<hr>';
}
