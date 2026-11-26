package io.github.wksgh812code.esgcareermap;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Message;
import android.provider.MediaStore;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/**
 * ESG 커리어 맵 사이트를 앱 화면으로 보여 주는 웹뷰.
 * - 사이트 안의 페이지는 앱 안에서, 다른 사이트(채용 사이트, claude.ai 등)는 휴대폰 브라우저나 해당 앱으로 연다.
 * - 사이트가 window.AndroidBridge 로 파일 저장(백업, 캘린더 파일)과 클립보드 복사를 요청할 수 있다.
 * - 경험·자기소개서 데이터는 웹뷰 저장소(localStorage)에 남아 앱을 다시 열어도 유지된다.
 */
public class MainActivity extends Activity {

    static final String HOME = "https://wksgh812-code.github.io/esg-career-map/";
    static final String HOST = "wksgh812-code.github.io";
    static final String PATH = "/esg-career-map";
    private static final int REQ_FILE = 1;

    private WebView web;
    private ValueCallback<Uri[]> fileCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setSupportMultipleWindows(true);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        s.setMediaPlaybackRequiresUserGesture(true);
        s.setUserAgentString(s.getUserAgentString() + " EsgCareerMapApp/1");

        web.addJavascriptInterface(new Bridge(), "AndroidBridge");
        web.setWebViewClient(new SiteClient());
        web.setWebChromeClient(new ChromeClient());

        if (savedInstanceState != null) {
            web.restoreState(savedInstanceState);
        } else {
            web.loadUrl(HOME);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (web.canGoBack()) {
            web.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_FILE && fileCallback != null) {
            fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data));
            fileCallback = null;
        }
    }

    // ---------- 주소 처리 ----------

    static boolean isSite(Uri u) {
        return u != null && "https".equals(u.getScheme()) && HOST.equals(u.getHost())
                && u.getPath() != null && u.getPath().startsWith(PATH);
    }

    /** 사이트 밖 주소는 휴대폰의 브라우저나 해당 앱으로 연다. */
    void openOutside(Uri u) {
        try {
            Intent i = new Intent(Intent.ACTION_VIEW, u);
            i.addCategory(Intent.CATEGORY_BROWSABLE);
            startActivity(i);
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, "이 링크를 열 수 있는 앱이 없습니다.", Toast.LENGTH_SHORT).show();
        }
    }

    void openAny(Uri u) {
        if (isSite(u)) {
            web.loadUrl(u.toString());
        } else {
            openOutside(u);
        }
    }

    private class SiteClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri u = request.getUrl();
            if (isSite(u)) return false;
            openOutside(u);
            return true;
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            if (!request.isForMainFrame()) return;
            String html = "<!doctype html><html lang='ko'><head><meta charset='utf-8'>"
                    + "<meta name='viewport' content='width=device-width,initial-scale=1'>"
                    + "<style>body{font-family:sans-serif;background:#f5f7f6;color:#15201d;display:grid;place-items:center;min-height:90vh;margin:0;padding:24px;text-align:center}"
                    + "a{display:inline-block;margin-top:16px;padding:10px 18px;border-radius:8px;background:#0d6b5c;color:#fff;text-decoration:none}</style></head>"
                    + "<body><div><h2>사이트에 연결할 수 없습니다</h2><p>인터넷 연결을 확인한 뒤 다시 시도하세요.</p>"
                    + "<a href='" + HOME + "'>다시 시도</a></div></body></html>";
            view.loadDataWithBaseURL(null, html, "text/html", "utf-8", null);
        }
    }

    private class ChromeClient extends WebChromeClient {
        /** 새 창(target=_blank, window.open) 요청: 주소를 받아 사이트면 앱 안에서, 아니면 밖에서 연다. */
        @Override
        public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
            final WebView catcher = new WebView(MainActivity.this);
            catcher.setWebViewClient(new WebViewClient() {
                private boolean handled = false;

                private void handle(WebView v, Uri u) {
                    if (handled || u == null || "about".equals(u.getScheme())) return;
                    handled = true;
                    openAny(u);
                    v.stopLoading();
                    v.post(v::destroy);
                }

                @Override
                public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest request) {
                    handle(v, request.getUrl());
                    return true;
                }

                @Override
                public void onPageStarted(WebView v, String url, Bitmap favicon) {
                    handle(v, url == null ? null : Uri.parse(url));
                }
            });
            WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
            transport.setWebView(catcher);
            resultMsg.sendToTarget();
            return true;
        }

        /** 백업 파일 복원 등 파일 선택 */
        @Override
        public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> callback, FileChooserParams params) {
            if (fileCallback != null) fileCallback.onReceiveValue(null);
            fileCallback = callback;
            try {
                startActivityForResult(params.createIntent(), REQ_FILE);
                return true;
            } catch (ActivityNotFoundException e) {
                fileCallback = null;
                Toast.makeText(MainActivity.this, "파일을 고를 수 있는 앱이 없습니다.", Toast.LENGTH_SHORT).show();
                return false;
            }
        }
    }

    // ---------- 사이트에서 부르는 기능 (window.AndroidBridge) ----------

    private class Bridge {
        @JavascriptInterface
        public boolean copy(final String text) {
            runOnUiThread(() -> {
                ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                if (cm != null) cm.setPrimaryClip(ClipData.newPlainText("ESG 커리어 맵", text));
            });
            return true;
        }

        @JavascriptInterface
        public void saveFile(final String name, final String text, final String mime) {
            runOnUiThread(() -> save(name, text, mime));
        }
    }

    /** 다운로드 폴더에 파일을 저장한다. 캘린더 파일(.ics)은 저장 뒤 바로 캘린더 앱으로 연다. */
    void save(String name, String text, String mime) {
        String type = (mime == null || mime.isEmpty()) ? "application/octet-stream" : mime.split(";")[0].trim();
        byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
        try {
            Uri saved = null;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ContentResolver resolver = getContentResolver();
                ContentValues v = new ContentValues();
                v.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
                v.put(MediaStore.MediaColumns.MIME_TYPE, type);
                v.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                saved = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                if (saved == null) throw new IllegalStateException("저장 위치를 만들 수 없습니다");
                try (OutputStream out = resolver.openOutputStream(saved)) {
                    if (out == null) throw new IllegalStateException("파일을 열 수 없습니다");
                    out.write(bytes);
                }
                Toast.makeText(this, "다운로드 폴더에 저장했습니다: " + name, Toast.LENGTH_LONG).show();
            } else {
                File dir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                File f = new File(dir, name);
                try (FileOutputStream out = new FileOutputStream(f)) {
                    out.write(bytes);
                }
                Toast.makeText(this, "저장했습니다: " + f.getAbsolutePath(), Toast.LENGTH_LONG).show();
            }
            if (saved != null && "text/calendar".equals(type)) {
                Intent i = new Intent(Intent.ACTION_VIEW);
                i.setDataAndType(saved, type);
                i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                try {
                    startActivity(Intent.createChooser(i, "캘린더에 추가"));
                } catch (ActivityNotFoundException ignored) {
                    // 캘린더 앱이 없으면 저장만 한다
                }
            }
        } catch (Exception e) {
            Toast.makeText(this, "파일을 저장하지 못했습니다: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }
}
