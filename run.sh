
export cli=/Applications/wechatwebdevtools.app/Contents/MacOS/cli

if [ $($cli islogin) == '{"login":true}' ]
then
echo 已经登陆，打开预览
$cli auto-preview --project /Users/xyf/Documents/assis_taro
else
echo 没有登陆，请登陆
$cli login --qr-size small
fi


