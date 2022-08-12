class UserAgent {
  constructor() {
    this.ua = navigator.userAgent.toLowerCase();
  }

  isSp() {
    const pathName = location.pathname;
    const isSP = pathName.includes('spn/');
    return isSP;
  }

  isSafari() {
    const ua = this.ua;
    const hasSafari = ua.includes('safari');
    const hasChrome = ua.includes('chrome');

    // chromeでもmacユーザならsafariの文字列が入るため、'chrome'の存在確認が必要。
    const isSafariUser = hasSafari && !hasChrome;
    console.log({ isSafari: isSafariUser });
    return isSafariUser;
  }

  isIE() {
    const ua = this.ua;
    const isIE = /msie|trident/.test(ua);
    console.log({ isIE });
    return isIE;
  }

  isCokeON() {
    const pathName = location.pathname;
    const isApp = pathName.includes('app/');
    return isApp;
  }
}

export default new UserAgent();
