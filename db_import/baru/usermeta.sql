-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Aug 19, 2025 at 02:25 PM
-- Server version: 10.11.10-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `naramakna_clean`
--

-- --------------------------------------------------------

--
-- Table structure for table `usermeta`
--

CREATE TABLE `usermeta` (
  `umeta_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `meta_key` varchar(255) DEFAULT NULL,
  `meta_value` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

--
-- Dumping data for table `usermeta`
--

INSERT INTO `usermeta` (`umeta_id`, `user_id`, `meta_key`, `meta_value`) VALUES
(1, 1, 'nickname', 'nm'),
(2, 1, 'first_name', 'nara'),
(3, 1, 'last_name', 'makna'),
(4, 1, 'description', ''),
(5, 1, 'rich_editing', 'true'),
(6, 1, 'syntax_highlighting', 'true'),
(7, 1, 'comment_shortcuts', 'false'),
(8, 1, 'admin_color', 'fresh'),
(9, 1, 'use_ssl', '0'),
(10, 1, 'show_admin_bar_front', 'true'),
(11, 1, 'locale', ''),
(12, 1, 'wp_capabilities', 'a:1:{s:13:\"administrator\";b:1;}'),
(13, 1, 'wp_user_level', '10'),
(14, 1, 'dismissed_wp_pointers', 'plugin_editor_notice,custom_admin_pointers14_2_3_new_items'),
(15, 1, 'show_welcome_panel', '1'),
(16, 1, 'session_tokens', 'a:2:{s:64:\"5e31275e9f49a8fe854bfcd3b94353b2bacf1271b765115e9593a9549c7a87a8\";a:4:{s:10:\"expiration\";i:1755484236;s:2:\"ip\";s:12:\"36.78.82.175\";s:2:\"ua\";s:117:\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\";s:5:\"login\";i:1755311436;}s:64:\"10a087303788e21c99a3770f327fb6ba9ab10e51f1659b5587ea9904294cdbcd\";a:4:{s:10:\"expiration\";i:1755499364;s:2:\"ip\";s:12:\"36.78.82.175\";s:2:\"ua\";s:117:\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\";s:5:\"login\";i:1755326564;}}'),
(17, 1, 'wp_dashboard_quick_press_last_post_id', '3589'),
(18, 1, 'community-events-location', 'a:1:{s:2:\"ip\";s:10:\"36.78.82.0\";}'),
(19, 1, 'wp_persisted_preferences', 'a:4:{s:14:\"core/edit-post\";a:1:{s:12:\"welcomeGuide\";s:0:\"\";}s:14:\"core/edit-site\";a:1:{s:12:\"welcomeGuide\";s:0:\"\";}s:9:\"_modified\";s:24:\"2025-07-10T10:10:54.169Z\";s:4:\"core\";a:3:{s:14:\"inactivePanels\";a:1:{i:0;s:24:\"meta-box-aioseo-settings\";}s:26:\"isComplementaryAreaVisible\";b:1;s:10:\"openPanels\";a:3:{i:0;s:11:\"post-status\";i:1;s:23:\"taxonomy-panel-category\";i:2;s:41:\"aioseo-publish-panel/aioseo-publish-panel\";}}}'),
(20, 1, 'hostinger_meta-box-aioseo-settings_changed', '1'),
(21, 1, 'wp_user-settings', 'libraryContent=browse&urlbutton=custom&imgsize=full&hidetb=1&editor=tinymce'),
(22, 1, 'wp_user-settings-time', '1753242723'),
(23, 1, 'seoboost_user_options_1', '{\"language\":\"en\",\"country\":\"US\"}'),
(24, 1, 'nav_menu_recently_edited', '23'),
(25, 1, 'managenav-menuscolumnshidden', 'a:3:{i:0;s:11:\"link-target\";i:1;s:15:\"title-attribute\";i:2;s:3:\"xfn\";}'),
(26, 1, 'metaboxhidden_nav-menus', 'a:3:{i:0;s:12:\"add-post_tag\";i:1;s:15:\"add-post_format\";i:2;s:13:\"add-newstopic\";}'),
(27, 1, '_aioseo_settings', 'a:8:{s:14:\"showUpgradeBar\";b:1;s:15:\"showSetupWizard\";b:1;s:12:\"toggledCards\";a:86:{s:17:\"dashboardOverview\";b:1;s:17:\"dashboardSeoSetup\";b:1;s:21:\"dashboardSeoSiteScore\";b:1;s:22:\"dashboardNotifications\";b:1;s:16:\"dashboardSupport\";b:1;s:7:\"license\";b:1;s:14:\"webmasterTools\";b:1;s:17:\"enableBreadcrumbs\";b:1;s:18:\"breadcrumbSettings\";b:1;s:19:\"breadcrumbTemplates\";b:1;s:8:\"advanced\";b:1;s:13:\"accessControl\";b:1;s:10:\"rssContent\";b:1;s:14:\"generalSitemap\";b:1;s:22:\"generalSitemapSettings\";b:1;s:12:\"imageSitemap\";b:1;s:12:\"videoSitemap\";b:1;s:11:\"newsSitemap\";b:1;s:10:\"rssSitemap\";b:1;s:18:\"rssSitemapSettings\";b:1;s:18:\"rssAdditionalPages\";b:1;s:19:\"rssAdvancedSettings\";b:1;s:15:\"additionalPages\";b:1;s:16:\"advancedSettings\";b:1;s:20:\"videoSitemapSettings\";b:1;s:20:\"videoAdditionalPages\";b:1;s:21:\"videoAdvancedSettings\";b:1;s:18:\"videoEmbedSettings\";b:1;s:19:\"newsSitemapSettings\";b:1;s:19:\"newsAdditionalPages\";b:1;s:20:\"newsAdvancedSettings\";b:1;s:17:\"newsEmbedSettings\";b:1;s:14:\"socialProfiles\";b:1;s:8:\"facebook\";b:1;s:24:\"facebookHomePageSettings\";b:1;s:24:\"facebookAdvancedSettings\";b:1;s:7:\"twitter\";b:1;s:23:\"twitterHomePageSettings\";b:1;s:9:\"pinterest\";b:1;s:20:\"searchTitleSeparator\";b:1;s:14:\"searchHomePage\";b:1;s:12:\"searchSchema\";b:1;s:22:\"searchMediaAttachments\";b:1;s:14:\"searchAdvanced\";b:1;s:26:\"searchAdvancedCrawlCleanup\";b:1;s:13:\"searchCleanup\";b:1;s:14:\"authorArchives\";b:1;s:12:\"dateArchives\";b:1;s:14:\"searchArchives\";b:1;s:8:\"imageSeo\";b:1;s:20:\"completeSeoChecklist\";b:1;s:17:\"localBusinessInfo\";b:1;s:25:\"localBusinessOpeningHours\";b:1;s:17:\"locationsSettings\";b:1;s:25:\"advancedLocationsSettings\";b:1;s:23:\"localBusinessMapsApiKey\";b:1;s:25:\"localBusinessMapsSettings\";b:1;s:12:\"robotsEditor\";b:1;s:13:\"databaseTools\";b:1;s:14:\"htaccessEditor\";b:1;s:17:\"databaseToolsLogs\";b:1;s:16:\"systemStatusInfo\";b:1;s:17:\"addNewRedirection\";b:1;s:16:\"redirectSettings\";b:1;s:5:\"debug\";b:1;s:25:\"fullSiteRedirectsRelocate\";b:1;s:24:\"fullSiteRedirectsAliases\";b:1;s:26:\"fullSiteRedirectsCanonical\";b:1;s:28:\"fullSiteRedirectsHttpHeaders\";b:1;s:11:\"htmlSitemap\";b:1;s:19:\"htmlSitemapSettings\";b:1;s:27:\"htmlSitemapAdvancedSettings\";b:1;s:21:\"linkAssistantSettings\";b:1;s:17:\"domainActivations\";b:1;s:11:\"404Settings\";b:1;s:12:\"userProfiles\";b:1;s:12:\"queryArgLogs\";b:1;s:17:\"aiContentSettings\";b:1;s:24:\"writingAssistantSettings\";b:1;s:19:\"writingAssistantCta\";b:1;s:6:\"postSA\";b:1;s:6:\"pageSA\";b:1;s:12:\"attachmentSA\";b:1;s:10:\"categorySA\";b:1;s:10:\"post_tagSA\";b:1;s:11:\"newstopicSA\";b:1;}s:12:\"toggledRadio\";a:3:{s:29:\"breadcrumbsShowMoreSeparators\";b:0;s:24:\"searchShowMoreSeparators\";b:0;s:16:\"overviewPostType\";s:4:\"post\";}s:15:\"dismissedAlerts\";a:3:{s:31:\"searchStatisticsContentRankings\";b:0;s:25:\"searchConsoleNotConnected\";b:0;s:26:\"searchConsoleSitemapErrors\";b:0;}s:12:\"internalTabs\";a:10:{s:14:\"authorArchives\";s:17:\"title-description\";s:12:\"dateArchives\";s:17:\"title-description\";s:14:\"searchArchives\";s:17:\"title-description\";s:17:\"seoAuditChecklist\";s:9:\"all-items\";s:6:\"postSA\";s:17:\"title-description\";s:6:\"pageSA\";s:17:\"title-description\";s:12:\"attachmentSA\";s:17:\"title-description\";s:10:\"categorySA\";s:17:\"title-description\";s:10:\"post_tagSA\";s:17:\"title-description\";s:11:\"newstopicSA\";s:17:\"title-description\";}s:15:\"tablePagination\";a:17:{s:14:\"networkDomains\";i:20;s:9:\"redirects\";i:20;s:12:\"redirectLogs\";i:20;s:15:\"redirect404Logs\";i:20;s:22:\"sitemapAdditionalPages\";i:20;s:24:\"linkAssistantLinksReport\";i:20;s:24:\"linkAssistantPostsReport\";i:20;s:26:\"linkAssistantDomainsReport\";i:20;s:29:\"searchStatisticsSeoStatistics\";i:20;s:31:\"searchStatisticsKeywordRankings\";i:20;s:31:\"searchStatisticsContentRankings\";i:20;s:34:\"searchStatisticsPostDetailKeywords\";i:20;s:27:\"searchStatisticsKrtKeywords\";i:20;s:25:\"searchStatisticsKrtGroups\";i:20;s:38:\"searchStatisticsKrtGroupsTableKeywords\";i:10;s:27:\"searchStatisticsIndexStatus\";i:20;s:9:\"queryArgs\";i:20;}s:14:\"semrushCountry\";s:2:\"US\";}'),
(28, 1, 'meta-box-order_post', 'a:3:{s:6:\"normal\";s:15:\"aioseo-settings\";s:8:\"advanced\";s:59:\"wpmedia_video_meta_metabox,aioseo-writing-assistant-metabox\";s:4:\"side\";s:20:\"litespeed_meta_boxes\";}'),
(30, 1, '_yoast_alerts_dismissed', 'a:1:{s:26:\"webinar-promo-notification\";b:1;}'),
(31, 1, 'wp_googlesitekit_tracking_optin', '1'),
(32, 1, 'wp_googlesitekit_access_token', 'p82rTAczdWIwM2hbP2HSyDVNNGpuYXJMYkxoSzBkdHUzMW51N01USzlsTW1JdUNkM0dWaWxSZ1BHcGxac3Y4em9wRUF5NlBucTFENGl3QlU1b3ZXTVBQUVpBOSs3WVlpOXB2clJLbVhHQTh5VVJxTGcvQUs5YWI2T1VRYkx6bG5Pc0IvU0lvYkwvaWpwTUpyNkR5QTdnanV6YmJJNjNxbHZOUXdTNWQrNEVpQ0NJT0VhM054MFZWR0xlQi9QbTJKdUlDK2d2V1lmNlVDU1VSUHl1ZnQwYy9JVFVwOVkvd1NXU1RVM3crTVpabUU2NlZNS1ZqMlR3NWs1eGRoUzJwSmRWUlRlR3dEKzJzVEtTaitmaUVaNTRGNUFQcHd6K2w3MjBzc2RiREZKWmZYSlN2eXlVNTJlMHBQeFdER1h1dkZIdHRlVFFKeHZzNjBGcEd1RnBUcWFUdXJ4eTFpbDIwdGd4RWF5V2JxZzNCcjcyNGt6OXJiNTRhMFFwamlRVXRsQ2JjcTJnTmZaTVZ2NENmckxnPT0='),
(33, 1, 'wp_googlesitekit_access_token_expires_in', '3599'),
(34, 1, 'wp_googlesitekit_access_token_created_at', '1755584079'),
(35, 1, 'wp_googlesitekit_refresh_token', 'XibB9fWMqzu1gkxZAo275XlUbm5VakFmTTNxVzRpcVQ2aDFWYUk5c05tNjQ0RjUreW1mcFJUWnhXcG92UmxGV08weXFJbTFLVzVRR2JqSGlscGZrQkM3MTl4L0lDaW16c2RwRnlvdTdvdDF4YXFYRUxQUDk0VDI0cXlMbDRaWGRvU2pSaVVMTG03eW81WGZjUWh6aUl5WGgxOExSdVgrQjd5b1lzT0JBU00rTUprVkEzUnVVQzE0OGhPbUQwUFVHQWQ4cWpib1kyUXg1OXB2YklhNGY5WFhtUy8rVmpBOTd0VlB3bnlwS1N2N0RZVWd4SU82MWQ0SjB0anJIRW80RjJhbHowYjBpek1BTUVmbWM3aHE4SGNaNFd5dGN6VnVvL291Z3kvQVVpd0lzZUFiUEFYZlpOSmlCbU5JNVgxMlVQUHo2OTlVV2N3L01vY1hW'),
(36, 1, 'wp_googlesitekit_auth_scopes', 'a:8:{i:0;s:46:\"https://www.googleapis.com/auth/userinfo.email\";i:1;s:50:\"https://www.googleapis.com/auth/analytics.readonly\";i:2;s:48:\"https://www.googleapis.com/auth/userinfo.profile\";i:3;s:48:\"https://www.googleapis.com/auth/adsense.readonly\";i:4;s:48:\"https://www.googleapis.com/auth/siteverification\";i:5;s:51:\"https://www.googleapis.com/auth/tagmanager.readonly\";i:6;s:42:\"https://www.googleapis.com/auth/webmasters\";i:7;s:6:\"openid\";}'),
(37, 1, 'wp_googlesitekit_additional_auth_scopes', 'a:0:{}'),
(38, 1, 'wp_googlesitekit_profile', 'a:4:{s:5:\"email\";s:22:\"naramaknaskt@gmail.com\";s:5:\"photo\";s:95:\"https://lh3.googleusercontent.com/a/ACg8ocIs-JbIQ76T5tSzsRriePGFeNPu32xlkd7rnY-mOa7hENpQGQ=s100\";s:9:\"full_name\";s:10:\"nara makna\";s:12:\"last_updated\";i:1755584080;}'),
(39, 1, 'wp_googlesitekitpersistent_initial_version', '1.159.0'),
(40, 1, 'wp_googlesitekit_site_verified_meta', 'verified'),
(41, 1, 'wp_googlesitekit_survey_timeouts', 'a:6:{s:14:\"view_dashboard\";i:1754808193;s:18:\"view_ga4_dashboard\";i:1755012968;s:18:\"view_kmw_setup_cta\";i:1755821359;s:8:\"__global\";i:1752777781;s:19:\"view_como_setup_cta\";i:1754032177;s:11:\"enable_como\";i:1754059000;}'),
(42, 1, 'wp_googlesitekitpersistent_dismissed_items', 'a:1:{s:22:\"zero-data-notification\";i:1752415589;}'),
(83, 3, 'nickname', 'B.G. Parameswara'),
(84, 3, 'first_name', 'B.G.'),
(85, 3, 'last_name', 'Parameswara'),
(86, 3, 'description', ''),
(87, 3, 'rich_editing', 'true'),
(88, 3, 'syntax_highlighting', 'true'),
(89, 3, 'comment_shortcuts', 'false'),
(90, 3, 'admin_color', 'fresh'),
(91, 3, 'use_ssl', '0'),
(92, 3, 'show_admin_bar_front', 'true'),
(93, 3, 'locale', ''),
(94, 3, 'wp_capabilities', 'a:1:{s:6:\"author\";b:1;}'),
(95, 3, 'wp_user_level', '2'),
(96, 3, 'dismissed_wp_pointers', ''),
(97, 1, 'amp_dev_tools_enabled', 'true'),
(98, 1, 'user_facebook', ''),
(99, 1, 'user_twitter', ''),
(100, 1, 'user_youtube', ''),
(101, 1, 'user_whatsapp', ''),
(102, 1, 'user_check', ''),
(103, 1, 'aioseo_profiles_same_username', 'a:3:{s:6:\"enable\";b:0;s:8:\"username\";s:0:\"\";s:8:\"included\";a:7:{i:0;s:15:\"facebookPageUrl\";i:1;s:10:\"twitterUrl\";i:2;s:9:\"tiktokUrl\";i:3;s:12:\"pinterestUrl\";i:4;s:12:\"instagramUrl\";i:5;s:10:\"youtubeUrl\";i:6;s:11:\"linkedinUrl\";}}'),
(104, 1, 'aioseo_facebook_page_url', ''),
(105, 1, 'aioseo_twitter_url', ''),
(106, 1, 'aioseo_instagram_url', ''),
(107, 1, 'aioseo_tiktok_url', ''),
(108, 1, 'aioseo_pinterest_url', ''),
(109, 1, 'aioseo_youtube_url', ''),
(110, 1, 'aioseo_linkedin_url', ''),
(111, 1, 'aioseo_tumblr_url', ''),
(112, 1, 'aioseo_yelp_page_url', ''),
(113, 1, 'aioseo_sound_cloud_url', ''),
(114, 1, 'aioseo_wikipedia_url', ''),
(115, 1, 'aioseo_myspace_url', ''),
(116, 1, 'aioseo_word_press_url', ''),
(117, 1, 'aioseo_bluesky_url', ''),
(118, 1, 'aioseo_threads_url', ''),
(119, 1, 'aioseo_profiles_additional_urls', ''),
(120, 4, 'nickname', 'Yosal Iriantara'),
(121, 4, 'first_name', 'Yosal'),
(122, 4, 'last_name', 'Iriantara'),
(123, 4, 'description', ''),
(124, 4, 'rich_editing', 'true'),
(125, 4, 'syntax_highlighting', 'true'),
(126, 4, 'comment_shortcuts', 'false'),
(127, 4, 'admin_color', 'fresh'),
(128, 4, 'use_ssl', '0'),
(129, 4, 'show_admin_bar_front', 'true'),
(130, 4, 'locale', ''),
(131, 4, 'wp_capabilities', 'a:1:{s:6:\"author\";b:1;}'),
(132, 4, 'wp_user_level', '2'),
(133, 4, 'dismissed_wp_pointers', ''),
(134, 5, 'nickname', 'Khaerunnisa'),
(135, 5, 'first_name', 'Khaerunnisa'),
(136, 5, 'last_name', ''),
(137, 5, 'description', ''),
(138, 5, 'rich_editing', 'true'),
(139, 5, 'syntax_highlighting', 'true'),
(140, 5, 'comment_shortcuts', 'false'),
(141, 5, 'admin_color', 'fresh'),
(142, 5, 'use_ssl', '0'),
(143, 5, 'show_admin_bar_front', 'true'),
(144, 5, 'locale', ''),
(145, 5, 'wp_capabilities', 'a:1:{s:6:\"author\";b:1;}'),
(146, 5, 'wp_user_level', '2'),
(147, 5, 'dismissed_wp_pointers', ''),
(149, 3, 'wp_persisted_preferences', 'a:3:{s:14:\"core/edit-post\";a:3:{s:12:\"welcomeGuide\";s:0:\"\";s:26:\"isComplementaryAreaVisible\";i:1;s:14:\"inactivePanels\";a:1:{i:0;s:24:\"meta-box-aioseo-settings\";}}s:14:\"core/edit-site\";a:2:{s:12:\"welcomeGuide\";s:0:\"\";s:26:\"isComplementaryAreaVisible\";i:1;}s:9:\"_modified\";s:25:\"2025-07-05T15:46:37+00:00\";}'),
(150, 3, 'hostinger_meta-box-aioseo-settings_changed', '1'),
(151, 3, 'wp_dashboard_quick_press_last_post_id', '3847'),
(152, 3, 'community-events-location', 'a:1:{s:2:\"ip\";s:10:\"36.78.82.0\";}'),
(154, 5, 'wp_persisted_preferences', 'a:3:{s:14:\"core/edit-post\";a:3:{s:12:\"welcomeGuide\";s:0:\"\";s:26:\"isComplementaryAreaVisible\";i:1;s:14:\"inactivePanels\";a:1:{i:0;s:24:\"meta-box-aioseo-settings\";}}s:14:\"core/edit-site\";a:2:{s:12:\"welcomeGuide\";s:0:\"\";s:26:\"isComplementaryAreaVisible\";i:1;}s:9:\"_modified\";s:25:\"2025-07-05T15:48:34+00:00\";}'),
(155, 5, 'hostinger_meta-box-aioseo-settings_changed', '1'),
(156, 5, 'wp_dashboard_quick_press_last_post_id', '3906'),
(157, 5, 'community-events-location', 'a:1:{s:2:\"ip\";s:13:\"182.253.194.0\";}'),
(158, 6, 'nickname', 'Waska Warta'),
(159, 6, 'first_name', 'Waska'),
(160, 6, 'last_name', 'Warta'),
(161, 6, 'description', ''),
(162, 6, 'rich_editing', 'true'),
(163, 6, 'syntax_highlighting', 'true'),
(164, 6, 'comment_shortcuts', 'false'),
(165, 6, 'admin_color', 'fresh'),
(166, 6, 'use_ssl', '0'),
(167, 6, 'show_admin_bar_front', 'true'),
(168, 6, 'locale', ''),
(169, 6, 'wp_capabilities', 'a:1:{s:6:\"author\";b:1;}'),
(170, 6, 'wp_user_level', '2'),
(171, 6, 'dismissed_wp_pointers', ''),
(173, 3, 'user_facebook', ''),
(174, 3, 'user_twitter', ''),
(175, 3, 'user_youtube', ''),
(176, 3, 'user_whatsapp', ''),
(177, 3, 'user_check', ''),
(178, 3, 'aioseo_profiles_same_username', 'a:3:{s:6:\"enable\";b:0;s:8:\"username\";s:0:\"\";s:8:\"included\";a:7:{i:0;s:15:\"facebookPageUrl\";i:1;s:10:\"twitterUrl\";i:2;s:9:\"tiktokUrl\";i:3;s:12:\"pinterestUrl\";i:4;s:12:\"instagramUrl\";i:5;s:10:\"youtubeUrl\";i:6;s:11:\"linkedinUrl\";}}'),
(179, 3, 'aioseo_facebook_page_url', ''),
(180, 3, 'aioseo_twitter_url', ''),
(181, 3, 'aioseo_instagram_url', ''),
(182, 3, 'aioseo_tiktok_url', ''),
(183, 3, 'aioseo_pinterest_url', ''),
(184, 3, 'aioseo_youtube_url', ''),
(185, 3, 'aioseo_linkedin_url', ''),
(186, 3, 'aioseo_tumblr_url', ''),
(187, 3, 'aioseo_yelp_page_url', ''),
(188, 3, 'aioseo_sound_cloud_url', ''),
(189, 3, 'aioseo_wikipedia_url', ''),
(190, 3, 'aioseo_myspace_url', ''),
(191, 3, 'aioseo_word_press_url', ''),
(192, 3, 'aioseo_bluesky_url', ''),
(193, 3, 'aioseo_threads_url', ''),
(194, 3, 'aioseo_profiles_additional_urls', ''),
(195, 3, 'seoboost_user_options_1', '{\"language\":\"en\",\"country\":\"US\"}'),
(196, 3, 'wp_user-settings', 'libraryContent=browse&imgsize=full&align=center&hidetb=1&post_dfw=off&editor=tinymce&editor_plain_text_paste_warning=1'),
(197, 3, 'wp_user-settings-time', '1754037695'),
(198, 3, 'session_tokens', 'a:3:{s:64:\"999fab289902e9ca6f6d13a86aba23b91d48de48a3c3940cd463bd9426f44f72\";a:4:{s:10:\"expiration\";i:1756038445;s:2:\"ip\";s:13:\"125.163.5.242\";s:2:\"ua\";s:117:\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36\";s:5:\"login\";i:1754828845;}s:64:\"5fe61306f5a12a16857b55977ebce61e04d42d5bc02bbae48e98b46f6e092a8e\";a:4:{s:10:\"expiration\";i:1755395319;s:2:\"ip\";s:12:\"36.78.82.175\";s:2:\"ua\";s:117:\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\";s:5:\"login\";i:1755222519;}s:64:\"c1f938e7a10c5084f76b6dfc3bb7be7172f44e688de8b5d6cb8085200ec53338\";a:4:{s:10:\"expiration\";i:1755442856;s:2:\"ip\";s:12:\"36.78.82.175\";s:2:\"ua\";s:117:\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\";s:5:\"login\";i:1755270056;}}'),
(200, 5, 'seoboost_user_options_1', '{\"language\":\"en\",\"country\":\"US\"}'),
(201, 5, 'session_tokens', 'a:3:{s:64:\"eb55e4a880f4f9f4d13829f7d99dddfec61f3798e61d5bc8cd983e20f4aac25f\";a:4:{s:10:\"expiration\";i:1755505350;s:2:\"ip\";s:14:\"125.164.24.135\";s:2:\"ua\";s:125:\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0\";s:5:\"login\";i:1754295750;}s:64:\"ebb2fbaf08063e9b4d3b5d9f74caf94e978542701a6d3c4b62674f90b285f56e\";a:4:{s:10:\"expiration\";i:1756523233;s:2:\"ip\";s:14:\"182.253.194.23\";s:2:\"ua\";s:135:\"Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1\";s:5:\"login\";i:1755313633;}s:64:\"148739d4415b2d2f40e970233b922ba2118a59f8659d9293ff5ceda0f2cd1da3\";a:4:{s:10:\"expiration\";i:1755487407;s:2:\"ip\";s:14:\"182.253.194.23\";s:2:\"ua\";s:111:\"Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36\";s:5:\"login\";i:1755314607;}}'),
(202, 5, 'wp_user-settings', 'libraryContent=browse&hidetb=1&imgsize=large&editor_plain_text_paste_warning=2&mfold=f'),
(203, 5, 'wp_user-settings-time', '1755148811'),
(204, 3, 'meta-box-order_post', 'a:3:{s:4:\"side\";s:124:\"formatdiv,submitdiv,categorydiv,tagsdiv-post_tag,tagsdiv-newstopic,litespeed_meta_boxes,om-global-post-settings,postimagediv\";s:6:\"normal\";s:110:\"aioseo-settings,postexcerpt,trackbacksdiv,postcustom,commentstatusdiv,slugdiv,aioseo-writing-assistant-metabox\";s:8:\"advanced\";s:26:\"wpmedia_video_meta_metabox\";}'),
(205, 3, 'screen_layout_post', '2'),
(208, 7, 'nickname', 'Tansah Rahmatullah'),
(209, 7, 'first_name', 'Tansah'),
(210, 7, 'last_name', 'Rahmatullah'),
(211, 7, 'description', ''),
(212, 7, 'rich_editing', 'true'),
(213, 7, 'syntax_highlighting', 'true'),
(214, 7, 'comment_shortcuts', 'false'),
(215, 7, 'admin_color', 'fresh'),
(216, 7, 'use_ssl', '0'),
(217, 7, 'show_admin_bar_front', 'true'),
(218, 7, 'locale', ''),
(219, 7, 'wp_capabilities', 'a:1:{s:6:\"author\";b:1;}'),
(220, 7, 'wp_user_level', '2'),
(221, 7, 'dismissed_wp_pointers', ''),
(222, 1, 'wp_googlesitekitpersistent_dismissed_prompts', 'a:2:{s:44:\"audience_segmentation_setup_cta-notification\";a:2:{s:7:\"expires\";i:0;s:5:\"count\";i:2;}s:29:\"consent-mode-setup-cta-widget\";a:2:{s:7:\"expires\";i:0;s:5:\"count\";i:1;}}'),
(223, 5, 'closedpostboxes_post', 'a:0:{}'),
(224, 5, 'metaboxhidden_post', 'a:5:{i:0;s:11:\"postexcerpt\";i:1;s:13:\"trackbacksdiv\";i:2;s:10:\"postcustom\";i:3;s:16:\"commentstatusdiv\";i:4;s:7:\"slugdiv\";}'),
(225, 5, 'meta-box-order_post', 'a:3:{s:4:\"side\";s:148:\"monsterinsights-metabox,submitdiv,categorydiv,formatdiv,tagsdiv-newstopic,tagsdiv-post_tag,om-global-post-settings,litespeed_meta_boxes,postimagediv\";s:6:\"normal\";s:123:\"aioseo-settings,postexcerpt,trackbacksdiv,postcustom,commentstatusdiv,slugdiv,aioseo-writing-assistant-metabox,revisionsdiv\";s:8:\"advanced\";s:26:\"wpmedia_video_meta_metabox\";}'),
(226, 5, 'screen_layout_post', '2'),
(227, 1, 'managetoplevel_page_wpcodecolumnshidden', 'a:3:{i:0;s:4:\"note\";i:1;s:9:\"shortcode\";i:2;s:7:\"updated\";}'),
(228, 1, 'wpcode_default_code_type', 'html'),
(229, 1, 'wpcode_snippet_activate_notice_shown', '1'),
(230, 3, 'closedpostboxes_post', 'a:1:{i:0;s:20:\"litespeed_meta_boxes\";}'),
(231, 3, 'metaboxhidden_post', 'a:5:{i:0;s:11:\"postexcerpt\";i:1;s:13:\"trackbacksdiv\";i:2;s:10:\"postcustom\";i:3;s:16:\"commentstatusdiv\";i:4;s:7:\"slugdiv\";}'),
(232, 8, 'nickname', 'Aas Fauziah'),
(233, 8, 'first_name', 'Aas'),
(234, 8, 'last_name', 'Fauziah'),
(235, 8, 'description', ''),
(236, 8, 'rich_editing', 'true'),
(237, 8, 'syntax_highlighting', 'true'),
(238, 8, 'comment_shortcuts', 'false'),
(239, 8, 'admin_color', 'fresh'),
(240, 8, 'use_ssl', '0'),
(241, 8, 'show_admin_bar_front', 'true'),
(242, 8, 'locale', ''),
(243, 8, 'wp_capabilities', 'a:1:{s:6:\"author\";b:1;}'),
(244, 8, 'wp_user_level', '2'),
(245, 8, 'dismissed_wp_pointers', ''),
(246, 8, 'user_facebook', ''),
(247, 8, 'user_twitter', ''),
(248, 8, 'user_youtube', ''),
(249, 8, 'user_whatsapp', ''),
(250, 8, 'user_check', ''),
(251, 8, 'aioseo_profiles_same_username', 'a:3:{s:6:\"enable\";b:0;s:8:\"username\";s:0:\"\";s:8:\"included\";a:7:{i:0;s:15:\"facebookPageUrl\";i:1;s:10:\"twitterUrl\";i:2;s:9:\"tiktokUrl\";i:3;s:12:\"pinterestUrl\";i:4;s:12:\"instagramUrl\";i:5;s:10:\"youtubeUrl\";i:6;s:11:\"linkedinUrl\";}}'),
(252, 8, 'aioseo_facebook_page_url', ''),
(253, 8, 'aioseo_twitter_url', ''),
(254, 8, 'aioseo_instagram_url', ''),
(255, 8, 'aioseo_tiktok_url', ''),
(256, 8, 'aioseo_pinterest_url', ''),
(257, 8, 'aioseo_youtube_url', ''),
(258, 8, 'aioseo_linkedin_url', ''),
(259, 8, 'aioseo_tumblr_url', ''),
(260, 8, 'aioseo_yelp_page_url', ''),
(261, 8, 'aioseo_sound_cloud_url', ''),
(262, 8, 'aioseo_wikipedia_url', ''),
(263, 8, 'aioseo_myspace_url', ''),
(264, 8, 'aioseo_word_press_url', ''),
(265, 8, 'aioseo_bluesky_url', ''),
(266, 8, 'aioseo_threads_url', ''),
(267, 8, 'aioseo_profiles_additional_urls', ''),
(268, 8, 'default_password_nag', ''),
(269, 8, 'session_tokens', 'a:3:{s:64:\"17fbadc88af34e2b577cb043273f7292435cdcb985ac3efe672653d0210f6392\";a:4:{s:10:\"expiration\";i:1755759372;s:2:\"ip\";s:14:\"114.10.148.207\";s:2:\"ua\";s:135:\"Mozilla/5.0 (iPad; CPU OS 18_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/139.0.7258.76 Mobile/15E148 Safari/604.1\";s:5:\"login\";i:1755586572;}s:64:\"ccf049104e69e92d0ce6d110b5c82d4e6a9768a775900deefc3c5a8704ce30c8\";a:4:{s:10:\"expiration\";i:1755759373;s:2:\"ip\";s:14:\"114.10.148.207\";s:2:\"ua\";s:135:\"Mozilla/5.0 (iPad; CPU OS 18_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/139.0.7258.76 Mobile/15E148 Safari/604.1\";s:5:\"login\";i:1755586573;}s:64:\"14eca0450bb684695ca9799ed329d6a1c56469d1d9391afdca302982f27941ee\";a:4:{s:10:\"expiration\";i:1755759374;s:2:\"ip\";s:14:\"114.10.148.207\";s:2:\"ua\";s:135:\"Mozilla/5.0 (iPad; CPU OS 18_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/139.0.7258.76 Mobile/15E148 Safari/604.1\";s:5:\"login\";i:1755586574;}}'),
(270, 8, 'wp_persisted_preferences', 'a:3:{s:14:\"core/edit-post\";a:3:{s:12:\"welcomeGuide\";s:0:\"\";s:26:\"isComplementaryAreaVisible\";i:1;s:14:\"inactivePanels\";a:1:{i:0;s:24:\"meta-box-aioseo-settings\";}}s:14:\"core/edit-site\";a:2:{s:12:\"welcomeGuide\";s:0:\"\";s:26:\"isComplementaryAreaVisible\";i:1;}s:9:\"_modified\";s:25:\"2025-07-13T18:58:33+07:00\";}'),
(271, 8, 'hostinger_meta-box-aioseo-settings_changed', '1'),
(272, 8, 'wp_dashboard_quick_press_last_post_id', '1672'),
(273, 8, 'community-events-location', 'a:1:{s:2:\"ip\";s:12:\"114.10.147.0\";}'),
(274, 8, 'seoboost_user_options_1', '{\"language\":\"en\",\"country\":\"US\"}'),
(275, 8, 'meta-box-order_post', 'a:3:{s:4:\"side\";s:127:\"monsterinsights-metabox,submitdiv,tagsdiv-post_tag,tagsdiv-newstopic,postimagediv,categorydiv,om-global-post-settings,formatdiv\";s:6:\"normal\";s:144:\"aioseo-settings,litespeed_meta_boxes,aioseo-writing-assistant-metabox,postexcerpt,trackbacksdiv,postcustom,commentstatusdiv,slugdiv,revisionsdiv\";s:8:\"advanced\";s:26:\"wpmedia_video_meta_metabox\";}'),
(276, 8, 'screen_layout_post', '2'),
(277, 1, 'wp_googlesitekit_survey_queue', 'a:0:{}'),
(278, 8, 'wp_user-settings', 'hidetb=1&editor_plain_text_paste_warning=2&libraryContent=browse&imgsize=large'),
(279, 8, 'wp_user-settings-time', '1752641725'),
(280, 1, 'closedpostboxes_post', 'a:0:{}'),
(281, 1, 'metaboxhidden_post', 'a:6:{i:0;s:11:\"postexcerpt\";i:1;s:13:\"trackbacksdiv\";i:2;s:10:\"postcustom\";i:3;s:16:\"commentstatusdiv\";i:4;s:7:\"slugdiv\";i:5;s:9:\"authordiv\";}'),
(282, 8, 'closedpostboxes_post', 'a:0:{}'),
(283, 8, 'metaboxhidden_post', 'a:5:{i:0;s:11:\"postexcerpt\";i:1;s:13:\"trackbacksdiv\";i:2;s:10:\"postcustom\";i:3;s:16:\"commentstatusdiv\";i:4;s:7:\"slugdiv\";}'),
(284, 1, 'wp_googlesitekit_redirect_url', 'https://naramakna.id/wp-admin/admin.php?page=googlesitekit-dashboard&slug=reader-revenue-manager&reAuth=true&notification=authentication_success'),
(285, 1, 'wp_googlesitekit_error_redirect_url', NULL),
(286, 3, '_aioseo_plugin_review_dismissed', '3'),
(287, 5, 'meta-box-order_dashboard', 'a:4:{s:6:\"normal\";s:89:\"dashboard_widget_kentooz,dashboard_right_now,dashboard_activity,aioseo-overview,themeisle\";s:4:\"side\";s:39:\"dashboard_quick_press,dashboard_primary\";s:7:\"column3\";s:0:\"\";s:7:\"column4\";s:0:\"\";}'),
(288, 1, 'wpforms_overview_table_columns', 'a:6:{i:1;s:4:\"name\";i:2;s:4:\"tags\";i:3;s:6:\"author\";i:4;s:9:\"shortcode\";i:5;s:7:\"created\";i:6;s:9:\"locations\";}');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `usermeta`
--
ALTER TABLE `usermeta`
  ADD PRIMARY KEY (`umeta_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `meta_key` (`meta_key`(191));

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `usermeta`
--
ALTER TABLE `usermeta`
  MODIFY `umeta_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=289;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
