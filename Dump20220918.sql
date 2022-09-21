CREATE DATABASE  IF NOT EXISTS `vnu_route_planner_db_test` /*!40100 DEFAULT CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `vnu_route_planner_db_test`;
-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: localhost    Database: vnu_route_planner_db_test
-- ------------------------------------------------------
-- Server version	8.0.30

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `dangky`
--

DROP TABLE IF EXISTS `dangky`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dangky` (
  `MSV` int DEFAULT NULL,
  `Mã_LHP` varchar(10) DEFAULT NULL,
  `Nhóm` varchar(2) DEFAULT NULL,
  `Ghi chú` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dangky`
--

LOCK TABLES `dangky` WRITE;
/*!40000 ALTER TABLE `dangky` DISABLE KEYS */;
INSERT INTO `dangky` VALUES (21020537,'INT2210 24','2','ĐK lần đầu'),(21020537,'INT2211 24','1','ĐK lần đầu'),(21020537,'PES1003 2','CL','Học tự do'),(21020537,'INT2212 24','CL','ĐK lần đầu'),(21020537,'INT2204 22','1','ĐK lần đầu'),(21020537,'ELT2035 21','CL','ĐK lần đầu'),(21020552,'INT2210 24','2','ĐK lần đầu'),(21020552,'INT2211 24','2','ĐK lần đầu'),(21020552,'PES1003 1','CL','Học tự do'),(21020552,'INT2212 24','CL','ĐK lần đầu'),(21020552,'INT2204 22','4','ĐK lần đầu'),(21020552,'JAP4023 1','CL','ĐK lần đầu'),(21020552,'MAT1101 10','CL','ĐK lần đầu'),(21020021,'INT2210 24','2','ĐK lần đầu'),(21020021,'INT2211 24','2','ĐK lần đầu'),(21020021,'INT2212 24','CL','ĐK lần đầu'),(21020021,'INT2204 22','4','ĐK lần đầu'),(21020021,'HIS1001 20','CL','ĐK lần đầu'),(21020021,'JAP4023 1','CL','ĐK lần đầu');
/*!40000 ALTER TABLE `dangky` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lopmonhoc`
--

DROP TABLE IF EXISTS `lopmonhoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lopmonhoc` (
  `Mã_LHP` varchar(10) DEFAULT NULL,
  `Nhóm` varchar(2) DEFAULT NULL,
  `Tuần` varchar(4) DEFAULT NULL,
  `Thứ` int DEFAULT NULL,
  `Tiết` varchar(5) DEFAULT NULL,
  `Giảng_đường` varchar(11) DEFAULT NULL,
  `Số_SV` varchar(3) DEFAULT NULL,
  `Giảng_viên/Trợ_giảng` varchar(43) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lopmonhoc`
--

LOCK TABLES `lopmonhoc` WRITE;
/*!40000 ALTER TABLE `lopmonhoc` DISABLE KEYS */;
INSERT INTO `lopmonhoc` VALUES ('INT2210 24','CL','1-6',2,'8-9','308-GĐ2','70','TS. Tạ Việt Cường'),('INT2210 24','CL','1-6',2,'10-11','308-GĐ2','70','TS. Tạ Việt Cường'),('INT2210 24','CL','7-9',2,'10-11','Học online','70','TS. Tạ Việt Cường'),('INT2210 24','2','2-7',7,'1-2','PM402-E5','40','TS. Tạ Việt Cường \nCN. Đỗ Minh Khá'),('INT2210 24','2','2-7',7,'3-4','PM402-E5','40','TS. Tạ Việt Cường \nCN. Đỗ Minh Khá'),('INT2210 24','2','8-10',7,'1-2','Học online','40','TS. Tạ Việt Cường \nCN. Đỗ Minh Khá'),('INT2211 24','CL','',5,'1-2','103-G2','66','TS. Lê Hồng Hải'),('INT2211 24','1','2-8',5,'7-8','Học online','33','TS. Lê Hồng Hải  \nCN. Lê Thị Phương'),('INT2211 24','2','9-15',5,'7-8','PM207-G2','33','TS. Lê Hồng Hải  \nCN. Lê Thị Phương'),('INT2212 24','CL','',4,'9-12','107-G2','80','TS. Phạm Minh Triển'),('INT2204 22','CL','1-6',3,'1-2','301-G2','120','ThS. Nguyễn Thu Trang'),('INT2204 22','CL','1-6',4,'1-2','301-G2','120','ThS. Nguyễn Thu Trang'),('INT2204 22','CL','7-9',4,'1-2','Học online','120','ThS. Nguyễn Thu Trang'),('INT2204 22','1','2-7',6,'1-2','PM305-G2','30','ThS. Nguyễn Thu Trang \nCN. Nguyễn Tùng Lâm'),('INT2204 22','1','2-7',2,'1-2','PM208-G2','30','ThS. Nguyễn Thu Trang \nCN. Nguyễn Tùng Lâm'),('INT2204 22','1','8-10',2,'1-2','Học online','30','ThS. Nguyễn Thu Trang \nCN. Nguyễn Tùng Lâm'),('INT2204 22','4','2-7',3,'9-10','PM305-G2','30','ThS. Mai Thanh Minh'),('INT2204 22','4','2-7',3,'11-12','PM305-G2','30','ThS. Mai Thanh Minh'),('INT2204 22','4','8-10',3,'11-12','Học online','30','ThS. Mai Thanh Minh'),('ELT2035 21','CL','',6,'10-12','301-GĐ2','50','TS. Lưu Mạnh Hà \nTrợ giảng: CN. Lê Quốc Anh'),('JAP4023 1','CL','',2,'3-4','312-GĐ2','20','Công ty Framgia'),('JAP4023 1','CL','',3,'3-4','312-GĐ2','20','Công ty Framgia'),('JAP4023 1','CL','',4,'3-4','312-GĐ2','20','Công ty Framgia'),('JAP4023 1','CL','',5,'3-4','312-GĐ2','20','Công ty Framgia'),('JAP4023 1','CL','',6,'3-4','312-GĐ2','20','Công ty Framgia'),('MAT1101 10','CL','',5,'7-9','3-G3','110','TS. Nguyễn Văn Thắng'),('HIS1001 20','CL','',7,'9-10','3-G3','110','TS. Nguyễn Thị Thu Hường'),('PES1003 1','CL','',2,'1-2','Sân VĐ ĐHNN','','TT GDTC'),('PES1003 2','CL','',2,'3-4','Sân VĐ ĐHNN','','TT GDTC');
/*!40000 ALTER TABLE `lopmonhoc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `monhoc`
--

DROP TABLE IF EXISTS `monhoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monhoc` (
  `Mã_LHP` varchar(7) NOT NULL,
  `Tên_môn_học` varchar(30) DEFAULT NULL,
  `Số_TC` int DEFAULT NULL,
  PRIMARY KEY (`Mã_LHP`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `monhoc`
--

LOCK TABLES `monhoc` WRITE;
/*!40000 ALTER TABLE `monhoc` DISABLE KEYS */;
INSERT INTO `monhoc` VALUES ('ELT2035','Tín hiệu và hệ thống',3),('HIS1001','Lịch sử Đảng Cộng sản Việt Nam',2),('INT2204','Lập trình hướng đối tượng',3),('INT2210','Cấu trúc dữ liệu và giải thuật',4),('INT2211','Cơ sở dữ liệu',4),('INT2212','Kiến trúc máy tính',4),('JAP4023','Tiếng Nhật 2A',4),('MAT1101','Xác suất thống kê',3),('PES1003','Điền kinh',1);
/*!40000 ALTER TABLE `monhoc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sinhvien`
--

DROP TABLE IF EXISTS `sinhvien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sinhvien` (
  `MSV` int NOT NULL,
  `Tên` varchar(255) NOT NULL,
  `Ngày_sinh` date DEFAULT NULL,
  `Lớp_khóa_học` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`MSV`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sinhvien`
--

LOCK TABLES `sinhvien` WRITE;
/*!40000 ALTER TABLE `sinhvien` DISABLE KEYS */;
INSERT INTO `sinhvien` VALUES (21020021,'Nguyễn Việt Anh Khoa','2003-02-10','QH-2021-I/CQ-J'),(21020537,'Lê Thanh Bình','2003-02-06','QH-2021-I/CQ-J'),(21020552,'Mai Tú Phương','2003-11-09','QH-2021-I/CQ-J');
/*!40000 ALTER TABLE `sinhvien` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-09-18 17:53:14
