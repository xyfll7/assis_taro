export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/test/index',
    'pages/test/display',
  ],
  subPackages: [
    {
      root: "pages_user",
      pages: [
        "user_address_list",
        "user_express_path",
        "user_express",
        "user_image_cropper",
        "user_my",
        "user_orders",
        "user_publish",
      ]
    },
    {
      root: "pages_regiment",
      pages: [
        "regiment_batch_printing",
        "regiment_bind_account",
        "regiment_bind_printer_cloud",
        "regiment_collection_record",
        "regiment_my_team",
        "regiment_orders",
        "regiment_printer",
        "regiment_register",
        "regiment_setting",
      ]
    },
    {
      root: "pages_admin",
      pages: [
        "admin__collection_record",
        "admin__regiment_list",
      ]
    }
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#f6f6f6',
    backgroundColor: "#f6f6f6",
    navigationBarTitleText: '团长助手',
    navigationBarTextStyle: 'black',
  },
  lazyCodeLoading: "requiredComponents",
  style: "v2",
  sitemapLocation: "sitemap.json",
  requiredPrivateInfos: [
    "chooseLocation",
    "chooseAddress"
  ],
  plugins: {
    // logisticsPlugin: {
    //   version: "2.2.22",
    //   provider: "wx9ad912bf20548d92",
    // },
  }
});
