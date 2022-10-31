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
  `MSV` int NOT NULL,
  `Mã_HP` varchar(7) NOT NULL,
  `Mã_LHP` varchar(10) NOT NULL,
  `Nhóm` varchar(2) DEFAULT NULL,
  `ID_ghi_chú` int DEFAULT NULL,
  PRIMARY KEY (`MSV`,`Mã_HP`,`Mã_LHP`),
  KEY `fk_ghi_chu_idx` (`ID_ghi_chú`),
  KEY `dangky_fk_msv` (`MSV`),
  KEY `dangky_fk_hp` (`Mã_HP`),
  KEY `dangky_lopmonhoc_fk` (`Mã_HP`,`Mã_LHP`),
  CONSTRAINT `dangky_fk_hp` FOREIGN KEY (`Mã_HP`) REFERENCES `monhoc` (`Mã_HP`),
  CONSTRAINT `dangky_fk_id` FOREIGN KEY (`ID_ghi_chú`) REFERENCES `ghichu` (`ID_ghi_chú`),
  CONSTRAINT `dangky_fk_msv` FOREIGN KEY (`MSV`) REFERENCES `sinhvien` (`MSV`),
  CONSTRAINT `dangky_lopmonhoc_fk` FOREIGN KEY (`Mã_HP`, `Mã_LHP`) REFERENCES `lopmonhoc` (`Mã_HP`, `Mã_LHP`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dangky`
--

LOCK TABLES `dangky` WRITE;
/*!40000 ALTER TABLE `dangky` DISABLE KEYS */;
INSERT INTO `dangky` VALUES (21020021,'HIS1001','20','CL',1),(21020021,'INT2204','22','4',1),(21020021,'INT2210','24','2',1),(21020021,'INT2211','24','2',1),(21020021,'INT2212','24','CL',1),(21020021,'JAP4023','1','CL',1),(21020537,'ELT2035','21','CL',1),(21020537,'INT2204','22','1',1),(21020537,'INT2210','24','2',1),(21020537,'INT2211','24','1',1),(21020537,'INT2212','24','CL',1),(21020537,'PES1003','2','CL',2),(21020552,'INT2204','22','4',1),(21020552,'INT2210','24','2',1),(21020552,'INT2211','24','2',1),(21020552,'INT2212','24','CL',1),(21020552,'JAP4023','1','CL',1),(21020552,'MAT1101','10','CL',1),(21020552,'PES1003','1','CL',2);
/*!40000 ALTER TABLE `dangky` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dijkstra`
--

DROP TABLE IF EXISTS `dijkstra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dijkstra` (
  `id1` int NOT NULL,
  `id2` int NOT NULL,
  `minDistance` double NOT NULL,
  `trackingID` int NOT NULL,
  PRIMARY KEY (`id1`,`id2`),
  KEY `fk_dijkstra_points2_idx` (`id2`),
  KEY `fk_dijkstra_points3_idx` (`trackingID`),
  CONSTRAINT `fk_dijkstra_points1` FOREIGN KEY (`id1`) REFERENCES `points` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_dijkstra_points2` FOREIGN KEY (`id2`) REFERENCES `points` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_dijkstra_points3` FOREIGN KEY (`trackingID`) REFERENCES `points` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dijkstra`
--

LOCK TABLES `dijkstra` WRITE;
/*!40000 ALTER TABLE `dijkstra` DISABLE KEYS */;
INSERT INTO `dijkstra` VALUES (1,2,9.102,1),(2,1,9.102,2),(2,3,29.31,2),(2,5,29.93,2),(3,2,29.31,3),(3,7,24.6,3),(3,94,14.67,3),(3,96,36.09,3),(4,9,12.26,4),(4,26,23.52,4),(4,96,27.65,4),(5,2,29.93,5),(5,6,50.89,5),(6,5,50.89,6),(6,8,27.56,6),(6,10,35.64,6),(7,3,24.6,7),(7,8,34.91,7),(8,6,27.56,8),(8,7,34.91,8),(8,100,9.6,8),(8,107,25.98,8),(9,4,12.26,9),(9,15,38.64,9),(9,107,25.98,9),(10,6,35.64,10),(10,11,17.02,10),(11,10,17.02,11),(11,12,18.98,11),(11,102,2.4,11),(12,11,18.98,12),(12,13,25.17,12),(13,12,25.17,13),(13,14,18.16,13),(13,17,45.2,13),(13,103,4.4,13),(13,104,7.85,13),(14,13,18.16,14),(14,15,27.02,14),(14,105,17.32,14),(15,9,38.64,15),(15,14,27.02,15),(15,18,41.15,15),(16,17,22.15,16),(17,13,45.2,17),(17,16,22.15,17),(17,18,42.41,17),(17,105,3.124,17),(17,147,15.94,17),(18,15,41.15,18),(18,17,42.41,18),(18,19,57.89,18),(18,146,1,18),(19,18,57.89,19),(19,20,32.31,19),(19,27,31.71,19),(20,19,32.31,20),(20,21,47.58,20),(20,35,62.27,20),(21,20,47.58,21),(21,29,37.61,21),(21,113,13,21),(21,123,21.15,21),(22,23,24.8,22),(22,34,35.14,22),(22,113,16.71,22),(23,22,24.8,23),(23,24,14.01,23),(23,28,31.44,23),(24,23,14.01,24),(24,25,26.39,24),(24,93,36.65,24),(24,111,10,24),(25,24,26.39,25),(25,26,69.48,25),(25,33,80.27,25),(25,82,34.64,25),(26,4,23.52,26),(26,25,69.48,26),(26,27,40.79,26),(26,97,14.63,26),(27,19,31.71,27),(27,26,40.79,27),(27,28,38.51,27),(27,106,12.5,27),(27,109,17,27),(28,23,31.44,28),(28,27,38.51,28),(28,108,18,28),(28,109,17,28),(28,110,17.51,28),(28,111,10,28),(29,21,37.61,29),(29,30,42.61,29),(29,55,9.733,29),(30,29,42.61,30),(30,31,30.75,30),(30,70,69.31,30),(30,71,10.08,30),(31,30,30.75,31),(31,34,44.52,31),(31,92,24.04,31),(32,33,27.53,32),(32,92,15.66,32),(32,93,10000,32),(33,25,80.27,33),(33,32,27.53,33),(33,75,69.57,33),(33,77,34.01,33),(34,22,35.14,34),(34,31,44.52,34),(34,116,3.321,34),(35,20,62.27,35),(35,36,41.75,35),(35,117,100,35),(35,118,120,35),(35,119,50,35),(35,120,53.5,35),(35,121,46.18,35),(35,122,120,35),(35,126,12.18,35),(36,35,41.75,36),(36,37,11.54,36),(36,54,39.61,36),(37,36,11.54,37),(37,38,9.962,37),(37,47,5.602,37),(38,37,9.962,38),(38,39,12.02,38),(39,38,12.02,39),(39,40,104.7,39),(40,39,104.7,40),(40,41,13.2,40),(41,40,13.2,41),(41,42,9.832,41),(41,43,11.69,41),(42,41,9.832,42),(43,41,11.69,43),(43,44,44.03,43),(44,43,44.03,44),(44,45,60.98,44),(44,131,15,44),(45,44,60.98,45),(45,46,10.92,45),(46,45,10.92,46),(46,48,12.52,46),(47,37,5.602,47),(47,48,4.551,47),(48,46,12.52,48),(48,47,4.551,48),(48,127,13.75,48),(48,136,63.86,48),(49,50,9.621,49),(49,52,14.71,49),(49,136,31.03,49),(50,49,9.621,50),(50,51,82.27,50),(50,132,43.18,50),(50,133,41.84,50),(51,50,82.27,51),(51,134,33.68,51),(51,135,23.21,51),(52,49,14.71,52),(52,53,25.13,52),(52,130,14.91,52),(53,52,25.13,53),(54,36,39.61,54),(54,124,30,54),(54,125,24.05,54),(54,127,26.23,54),(54,128,35.28,54),(55,29,9.733,55),(55,56,23.08,55),(56,55,23.08,56),(56,57,125.7,56),(57,56,125.7,57),(57,58,55.55,57),(57,139,22.76,57),(57,144,55.33,57),(58,57,55.55,58),(58,145,55.78,58),(59,60,19.74,59),(60,59,19.74,60),(60,61,12.98,60),(61,60,12.98,61),(61,62,34.75,61),(62,61,34.75,62),(62,63,133.1,62),(63,62,133.1,63),(63,64,32.32,63),(63,89,34.56,63),(64,63,32.32,64),(64,65,22.53,64),(64,67,47.02,64),(65,64,22.53,65),(65,66,38.85,65),(66,65,38.85,66),(67,64,47.02,67),(67,68,212.4,67),(67,91,90.21,67),(68,67,212.4,68),(68,69,30.82,68),(68,72,97.86,68),(69,68,30.82,69),(69,70,47.65,69),(69,73,97.89,69),(69,141,6.56,69),(70,30,69.31,70),(70,69,47.65,70),(70,76,55.79,70),(70,137,15.46,70),(71,30,10.08,71),(71,138,17.66,71),(72,68,97.86,72),(72,73,31.03,72),(72,86,73.62,72),(73,69,97.89,73),(73,72,31.03,73),(73,74,38,73),(74,73,38,74),(74,75,9.066,74),(74,87,73.64,74),(74,143,42.03,74),(75,33,69.57,75),(75,74,9.066,75),(75,76,42.13,75),(76,70,55.79,76),(76,75,42.13,76),(76,92,69.55,76),(76,142,16.89,76),(77,33,34.01,77),(77,78,39.68,77),(77,83,43.76,77),(78,77,39.68,78),(78,79,43.06,78),(78,87,77.98,78),(79,78,43.06,79),(79,80,37.54,79),(79,84,13.98,79),(79,85,17.36,79),(80,79,37.54,80),(80,81,54.06,80),(80,82,39.33,80),(81,80,54.06,81),(81,99,19.91,81),(82,25,34.64,82),(82,80,39.33,82),(82,83,37.04,82),(83,77,43.76,83),(83,82,37.04,83),(83,84,40.44,83),(83,114,4.58,83),(84,79,13.98,84),(84,83,40.44,84),(85,79,17.36,85),(86,72,73.62,86),(86,87,70.31,86),(86,88,32.99,86),(87,74,73.64,87),(87,78,77.98,87),(87,86,70.31,87),(88,86,32.99,88),(89,63,34.56,89),(89,90,30.64,89),(90,89,30.64,90),(91,67,90.21,91),(91,140,10.53,91),(91,145,46.71,91),(92,31,24.04,92),(92,32,15.66,92),(92,76,69.55,92),(92,142,5.171,92),(93,24,36.65,93),(93,32,10000,93),(93,115,1.746,93),(94,3,14.67,94),(95,96,14.55,95),(96,3,36.09,96),(96,4,27.65,96),(96,95,14.55,96),(96,97,21.96,96),(97,26,14.63,97),(97,96,21.96,97),(97,98,20,97),(98,97,20,98),(99,81,19.91,99),(100,8,9.6,100),(101,107,8.3,101),(102,11,2.4,102),(103,13,4.4,103),(104,13,7.85,104),(105,14,17.32,105),(105,17,3.124,105),(106,27,12.5,106),(107,8,25.98,107),(107,9,25.98,107),(107,101,8.3,107),(108,28,18,108),(109,27,17,109),(109,28,17,109),(110,28,17.51,110),(111,24,10,111),(111,28,10,111),(112,113,6.375,112),(113,21,13,113),(113,22,16.71,113),(113,112,6.375,113),(114,83,4.58,114),(115,93,1.746,115),(116,34,3.321,116),(117,35,100,117),(118,35,120,118),(119,35,50,119),(120,35,53.5,120),(121,35,46.18,121),(122,35,120,122),(123,21,21.15,123),(124,54,30,124),(125,54,24.05,125),(126,35,12.18,126),(127,48,13.75,127),(127,54,26.23,127),(128,54,35.28,128),(129,136,15.61,129),(130,52,14.91,130),(131,44,15,131),(132,50,43.18,132),(133,50,41.84,133),(134,51,33.68,134),(135,51,23.21,135),(136,48,63.86,136),(136,49,31.03,136),(136,129,15.61,136),(137,70,15.46,137),(138,71,17.66,138),(139,57,22.76,139),(140,91,10.53,140),(141,69,6.56,141),(142,76,16.89,142),(142,92,5.171,142),(143,74,42.03,143),(144,57,55.33,144),(144,145,53.41,144),(145,58,55.78,145),(145,91,46.71,145),(145,144,53.41,145),(146,18,1,146),(147,17,15.94,147);
/*!40000 ALTER TABLE `dijkstra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `distance`
--

DROP TABLE IF EXISTS `distance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `distance` (
  `id1` int NOT NULL,
  `id2` int NOT NULL,
  `distance` double NOT NULL,
  PRIMARY KEY (`id1`,`id2`),
  KEY `fk_distance_points2_idx` (`id2`),
  CONSTRAINT `fk_distance_points1` FOREIGN KEY (`id1`) REFERENCES `points` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_distance_points2` FOREIGN KEY (`id2`) REFERENCES `points` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `distance`
--

LOCK TABLES `distance` WRITE;
/*!40000 ALTER TABLE `distance` DISABLE KEYS */;
INSERT INTO `distance` VALUES (1,2,9.102),(3,2,29.31),(3,96,36.09),(4,26,23.52),(4,96,27.65),(5,2,29.93),(5,6,50.89),(6,10,35.64),(7,3,24.6),(7,8,34.91),(8,6,27.56),(8,107,25.98),(9,4,12.26),(9,15,38.64),(9,107,25.98),(10,11,17.02),(11,12,18.98),(12,13,25.17),(13,17,45.2),(14,13,18.16),(14,15,27.02),(16,17,22.15),(18,15,41.15),(18,17,42.41),(18,19,57.89),(18,146,1),(19,27,31.71),(20,19,32.31),(20,35,62.27),(21,20,47.58),(21,29,37.61),(21,113,13),(22,23,24.8),(22,113,16.71),(24,23,14.01),(24,25,26.39),(24,93,36.65),(26,25,69.48),(27,26,40.79),(27,28,38.51),(28,23,31.44),(29,30,42.61),(30,70,69.31),(31,30,30.75),(31,34,44.52),(31,92,24.04),(32,33,27.53),(32,92,15.66),(32,93,10000),(33,25,80.27),(33,75,69.57),(34,22,35.14),(34,116,3.321),(35,36,41.75),(37,36,11.54),(37,47,5.602),(38,37,9.962),(39,38,12.02),(40,39,104.7),(40,41,13.2),(41,42,9.832),(43,41,11.69),(44,43,44.03),(44,131,15),(45,44,60.98),(46,45,10.92),(46,48,12.52),(48,47,4.551),(48,136,63.86),(49,136,31.03),(50,49,9.621),(51,50,82.27),(52,49,14.71),(53,52,25.13),(54,36,39.61),(55,29,9.733),(55,56,23.08),(56,57,125.7),(57,58,55.55),(57,144,55.33),(58,145,55.78),(59,60,19.74),(60,61,12.98),(62,61,34.75),(62,63,133.1),(63,89,34.56),(64,63,32.32),(65,64,22.53),(66,65,38.85),(67,64,47.02),(67,68,212.4),(67,91,90.21),(68,69,30.82),(68,72,97.86),(69,73,97.89),(70,69,47.65),(70,76,55.79),(71,30,10.08),(72,73,31.03),(72,86,73.62),(74,73,38),(74,75,9.066),(74,87,73.64),(76,75,42.13),(76,92,69.55),(77,33,34.01),(77,78,39.68),(77,83,43.76),(78,87,77.98),(79,78,43.06),(80,79,37.54),(80,82,39.33),(81,80,54.06),(82,25,34.64),(83,82,37.04),(83,84,40.44),(84,79,13.98),(85,79,17.36),(86,87,70.31),(86,88,32.99),(89,90,30.64),(91,145,46.71),(94,3,14.67),(95,96,14.55),(97,26,14.63),(97,96,21.96),(97,98,20),(99,81,19.91),(100,8,9.6),(101,107,8.3),(102,11,2.4),(103,13,4.4),(104,13,7.85),(105,14,17.32),(105,17,3.124),(106,27,12.5),(108,28,18),(109,27,17),(109,28,17),(110,28,17.51),(111,24,10),(111,28,10),(112,113,6.375),(114,83,4.58),(115,93,1.746),(117,35,100),(118,35,120),(119,35,50),(120,35,53.5),(121,35,46.18),(122,35,120),(123,21,21.15),(124,54,30),(125,54,24.05),(126,35,12.18),(127,48,13.75),(127,54,26.23),(128,54,35.28),(129,136,15.61),(130,52,14.91),(132,50,43.18),(133,50,41.84),(134,51,33.68),(135,51,23.21),(137,70,15.46),(138,71,17.66),(139,57,22.76),(140,91,10.53),(141,69,6.56),(142,76,16.89),(142,92,5.171),(143,74,42.03),(144,145,53.41),(147,17,15.94);
/*!40000 ALTER TABLE `distance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ghichu`
--

DROP TABLE IF EXISTS `ghichu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ghichu` (
  `ID_ghi_chú` int NOT NULL AUTO_INCREMENT,
  `Nội_dung` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID_ghi_chú`),
  UNIQUE KEY `Nội_dung_UNIQUE` (`Nội_dung`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ghichu`
--

LOCK TABLES `ghichu` WRITE;
/*!40000 ALTER TABLE `ghichu` DISABLE KEYS */;
INSERT INTO `ghichu` VALUES (1,'ĐK lần đầu'),(4,'Học cải thiện'),(3,'Học lại'),(2,'Học tự do');
/*!40000 ALTER TABLE `ghichu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `giangduong`
--

DROP TABLE IF EXISTS `giangduong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `giangduong` (
  `Mã_tòa_nhà` varchar(11) NOT NULL,
  `Thông_tin` varchar(104) DEFAULT NULL,
  PRIMARY KEY (`Mã_tòa_nhà`),
  KEY `Mã_tòa_nhà` (`Mã_tòa_nhà`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `giangduong`
--

LOCK TABLES `giangduong` WRITE;
/*!40000 ALTER TABLE `giangduong` DISABLE KEYS */;
INSERT INTO `giangduong` VALUES ('E5','Giảng đường.'),('G2','Giảng đường.'),('G3','Giảng đường.'),('GĐ2','Giảng đường 2. <br>Nhà ăn sinh viên.'),('Học online',''),('Sân VĐ ĐHNN','');
/*!40000 ALTER TABLE `giangduong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `giangvien`
--

DROP TABLE IF EXISTS `giangvien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `giangvien` (
  `ID_Giangvien` int NOT NULL,
  `Ten` varchar(24) DEFAULT NULL,
  PRIMARY KEY (`ID_Giangvien`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `giangvien`
--

LOCK TABLES `giangvien` WRITE;
/*!40000 ALTER TABLE `giangvien` DISABLE KEYS */;
INSERT INTO `giangvien` VALUES (0,''),(1,'TS. Tạ Việt Cường'),(2,'CN. Đỗ Minh Khá'),(3,'TS. Lê Hồng Hải'),(4,'CN. Lê Thị Phương'),(5,'TS. Phạm Minh Triển'),(6,'ThS. Nguyễn Thu Trang'),(7,'CN. Nguyễn Tùng Lâm'),(8,'ThS. Mai Thanh Minh'),(9,'TS. Lưu Mạnh Hà'),(10,'CN. Lê Quốc Anh'),(11,'Công ty Framgia'),(12,'TS. Nguyễn Văn Thắng'),(13,'TS. Nguyễn Thị Thu Hường'),(14,'TT GDTC');
/*!40000 ALTER TABLE `giangvien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lopmonhoc`
--

DROP TABLE IF EXISTS `lopmonhoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lopmonhoc` (
  `Mã_HP` varchar(7) NOT NULL,
  `Mã_LHP` varchar(10) NOT NULL,
  `Nhóm` varchar(2) NOT NULL,
  `Tuần` varchar(4) NOT NULL,
  `Thứ` int NOT NULL,
  `Tiết` varchar(5) NOT NULL,
  `Số_phòng` varchar(5) DEFAULT NULL,
  `Giảng_đường` varchar(11) DEFAULT NULL,
  `Số_SV` varchar(3) DEFAULT NULL,
  `Giảng_viên_1` int DEFAULT NULL,
  `Giảng_viên_2` int DEFAULT NULL,
  PRIMARY KEY (`Mã_HP`,`Mã_LHP`,`Nhóm`,`Tuần`,`Thứ`,`Tiết`),
  KEY `Giảng_đường` (`Giảng_đường`),
  KEY `Giảng_viên_1` (`Giảng_viên_1`,`Giảng_viên_2`),
  KEY `Giảng_viên_2` (`Giảng_viên_2`),
  CONSTRAINT `lopmonhoc_ibfk_1` FOREIGN KEY (`Giảng_đường`) REFERENCES `giangduong` (`Mã_tòa_nhà`),
  CONSTRAINT `lopmonhoc_ibfk_2` FOREIGN KEY (`Giảng_viên_1`) REFERENCES `giangvien` (`ID_Giangvien`),
  CONSTRAINT `lopmonhoc_ibfk_3` FOREIGN KEY (`Giảng_viên_2`) REFERENCES `giangvien` (`ID_Giangvien`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lopmonhoc`
--

LOCK TABLES `lopmonhoc` WRITE;
/*!40000 ALTER TABLE `lopmonhoc` DISABLE KEYS */;
INSERT INTO `lopmonhoc` VALUES ('ELT2035','21','CL','',6,'10-12','301','GĐ2','50',9,10),('HIS1001','20','CL','',7,'9-10','3','G3','110',13,0),('INT2204','22','1','2-7',2,'1-2','PM208','G2','30',6,7),('INT2204','22','1','2-7',6,'1-2','PM305','G2','30',6,7),('INT2204','22','1','8-10',2,'1-2','','Học online','30',6,7),('INT2204','22','4','2-7',3,'11-12','PM305','G2','30',8,0),('INT2204','22','4','2-7',3,'9-10','PM305','G2','30',8,0),('INT2204','22','4','8-10',3,'11-12','','Học online','30',8,0),('INT2204','22','CL','1-6',3,'1-2','301','G2','120',6,0),('INT2204','22','CL','1-6',4,'1-2','301','G2','120',6,0),('INT2204','22','CL','7-9',4,'1-2','','Học online','120',6,0),('INT2210','24','2','2-7',7,'1-2','PM402','E5','40',1,2),('INT2210','24','2','2-7',7,'3-4','PM402','E5','40',1,2),('INT2210','24','2','8-10',7,'1-2','','Học online','40',1,2),('INT2210','24','CL','1-6',2,'10-11','308','GĐ2','70',1,0),('INT2210','24','CL','1-6',2,'8-9','308','GĐ2','70',1,0),('INT2210','24','CL','7-9',2,'10-11','','Học online','70',1,0),('INT2211','24','1','2-8',5,'7-8','','Học online','33',3,4),('INT2211','24','2','9-15',5,'7-8','PM207','G2','33',3,4),('INT2211','24','CL','',5,'1-2','103','G2','66',3,0),('INT2212','24','CL','',4,'9-12','107','G2','80',5,0),('JAP4023','1','CL','',2,'3-4','312','GĐ2','20',11,0),('JAP4023','1','CL','',3,'3-4','312','GĐ2','20',11,0),('JAP4023','1','CL','',4,'3-4','312','GĐ2','20',11,0),('JAP4023','1','CL','',5,'3-4','312','GĐ2','20',11,0),('JAP4023','1','CL','',6,'3-4','312','GĐ2','20',11,0),('MAT1101','10','CL','',5,'7-9','3','G3','110',12,0),('PES1003','1','CL','',2,'1-2','','Sân VĐ ĐHNN','',14,0),('PES1003','2','CL','',2,'3-4','','Sân VĐ ĐHNN','',14,0);
/*!40000 ALTER TABLE `lopmonhoc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `monhoc`
--

DROP TABLE IF EXISTS `monhoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monhoc` (
  `Mã_HP` varchar(7) NOT NULL,
  `Tên_môn_học` varchar(30) DEFAULT NULL,
  `Số_TC` int DEFAULT NULL,
  PRIMARY KEY (`Mã_HP`)
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
-- Table structure for table `points`
--

DROP TABLE IF EXISTS `points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `points` (
  `id` int NOT NULL,
  `name` varchar(20) DEFAULT NULL,
  `main` int NOT NULL,
  `posY` decimal(10,8) DEFAULT NULL,
  `posX` decimal(11,8) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `points`
--

LOCK TABLES `points` WRITE;
/*!40000 ALTER TABLE `points` DISABLE KEYS */;
INSERT INTO `points` VALUES (1,'Cong vao DHQG',2,21.03678520,105.78208040),(2,'',0,21.03686700,105.78208360),(3,'',0,21.03713040,105.78209410),(4,'',0,21.03770360,105.78209950),(5,'',0,21.03688090,105.78179560),(6,'',0,21.03719820,105.78144230),(7,'',0,21.03715040,105.78185800),(8,'',0,21.03737740,105.78162570),(9,'',0,21.03770620,105.78198140),(10,'',0,21.03743350,105.78120910),(11,'',0,21.03758510,105.78123140),(12,'',0,21.03773050,105.78132720),(13,'',0,21.03795500,105.78135850),(14,'',0,21.03804050,105.78150760),(15,'',0,21.03798660,105.78176150),(16,'',0,21.03836390,105.78115280),(17,'',0,21.03836140,105.78136620),(18,'',0,21.03835650,105.78177480),(19,'',0,21.03834930,105.78233250),(20,'',0,21.03854680,105.78256080),(21,'',0,21.03853520,105.78301910),(22,'',0,21.03826800,105.78301640),(23,'',0,21.03804510,105.78300970),(24,'',0,21.03791910,105.78300870),(25,'',0,21.03768210,105.78299530),(26,'',0,21.03769740,105.78232600),(27,'',0,21.03806410,105.78233600),(28,'',0,21.03805320,105.78270690),(29,'',0,21.03853730,105.78338150),(30,'',0,21.03852970,105.78379200),(31,'',0,21.03825330,105.78378380),(32,'',0,21.03789640,105.78377390),(33,'',0,21.03764890,105.78376790),(34,'',0,21.03826150,105.78335490),(35,'',0,21.03910610,105.78259090),(36,'',0,21.03948110,105.78261110),(37,'',0,21.03958210,105.78263680),(38,'',0,21.03958910,105.78254110),(39,'',0,21.03959410,105.78242540),(40,'',0,21.03962020,105.78141710),(41,'',0,21.03968380,105.78130970),(42,'Cong DHNN',2,21.03969400,105.78121560),(43,'',0,21.03971580,105.78141700),(44,'',0,21.03970390,105.78184110),(45,'',0,21.03969080,105.78242850),(46,'',0,21.03967930,105.78253300),(47,'',0,21.03963050,105.78265180),(48,'',0,21.03967140,105.78265330),(49,'',0,21.04052430,105.78268460),(50,'Cong KTX NN',2,21.04052450,105.78259190),(51,'',0,21.04053930,105.78179930),(52,'',0,21.04065630,105.78269400),(53,'',0,21.04088170,105.78271100),(54,'',0,21.03947210,105.78299260),(55,'',0,21.03862480,105.78338400),(56,'',0,21.03883230,105.78339000),(57,'',0,21.03996260,105.78342300),(58,'',0,21.04046190,105.78344190),(59,'Cong',2,21.04056270,105.78403960),(60,'',0,21.04074020,105.78404320),(61,'',0,21.04085690,105.78404560),(62,'',0,21.04116940,105.78405200),(63,'',0,21.04110170,105.78533240),(64,'',0,21.04081120,105.78532280),(65,'',0,21.04081640,105.78510580),(66,'',0,21.04082830,105.78473170),(67,'',0,21.04038900,105.78529710),(68,'',0,21.03848050,105.78521500),(69,'',0,21.03849080,105.78491820),(70,'',0,21.03850660,105.78445940),(71,'Cong Chua Thanh Chua',2,21.03861760,105.78381580),(72,'',0,21.03760070,105.78518980),(73,'',0,21.03761080,105.78489100),(74,'',0,21.03762320,105.78452510),(75,'',0,21.03762620,105.78443780),(76,'',0,21.03800500,105.78444710),(77,'',0,21.03734310,105.78376260),(78,'',0,21.03698650,105.78374730),(79,'',0,21.03699600,105.78333250),(80,'',0,21.03701720,105.78297150),(81,'',0,21.03703990,105.78245120),(82,'',0,21.03737070,105.78298460),(83,'',0,21.03735720,105.78334120),(84,'',0,21.03712170,105.78333540),(85,'Cong ĐHSP',2,21.03683990,105.78332790),(86,'',0,21.03693880,105.78517520),(87,'',0,21.03696140,105.78449820),(88,'Cong phu DHSP',2,21.03664220,105.78516740),(89,'',0,21.04108930,105.78566510),(90,'',0,21.04107920,105.78596010),(91,'',0,21.04042310,105.78442860),(92,'',0,21.03803720,105.78377780),(93,'',0,21.03790860,105.78336170),(94,'G4',1,21.03701040,105.78233440),(95,'Sunwah',1,21.03732530,105.78229620),(96,'',0,21.03745500,105.78209450),(97,'B2',1,21.03758380,105.78225490),(98,'B1 CPS',1,21.03731760,105.78281530),(99,'B4',1,21.03684230,105.78264670),(100,'D1',1,21.03744100,105.78156800),(101,'D2',1,21.03759100,105.78175300),(102,'G6',1,21.03760030,105.78117760),(103,'G5',1,21.03783200,105.78146390),(104,'B1',1,21.03806730,105.78123020),(105,'G8',1,21.03826900,105.78148490),(106,'G3',1,21.03810700,105.78222500),(107,'',0,21.03754180,105.78180350),(108,'E1',1,21.03789510,105.78261910),(109,'E2',1,21.03808960,105.78254070),(110,'E3',1,21.03820900,105.78270800),(111,'E4',1,21.03802190,105.78289020),(112,'E5',1,21.03841510,105.78277060),(113,'',0,21.03841830,105.78301790),(114,'Nha Hieu Bo',1,21.03746180,105.78336140),(115,'G2',1,21.03791600,105.78336200),(116,'C1T',1,21.03828900,105.78336000),(117,'C1',1,21.03930170,105.78166680),(118,'C2',1,21.03867420,105.78158800),(119,'C3',1,21.03892530,105.78200600),(120,'C4',1,21.03866400,105.78221680),(121,'C5',1,21.03923280,105.78218480),(122,'C6',1,21.03898370,105.78138320),(123,'K',1,21.03884250,105.78298020),(124,'A1',1,21.03972150,105.78323360),(125,'A2',1,21.03931840,105.78315510),(126,'A3',1,21.03916830,105.78277470),(127,'A4',1,21.03972680,105.78283570),(128,'A5',1,21.03982990,105.78301830),(129,'A6',1,21.04020340,105.78304630),(130,'GĐ2',1,21.04065000,105.78283100),(131,'A7',1,21.03995870,105.78158010),(132,'14A',1,21.04067890,105.78222860),(133,'14B',1,21.04034230,105.78219860),(134,'14C',1,21.04061770,105.78149500),(135,'Y1',1,21.04028740,105.78161760),(136,'',0,21.04024540,105.78267440),(137,'Nha the chat DHSP',1,21.03868280,105.78463650),(138,'Chua Thanh Chua',1,21.03909980,105.78396570),(139,'Thu vien DHSP',1,21.04021230,105.78370250),(140,'San bong DHSP',1,21.03960300,105.78477740),(141,'Tieu hoc NTT',1,21.03868880,105.78502960),(142,'THPT CSP',1,21.03802460,105.78405670),(143,'THPT NTT',1,21.03724660,105.78479080),(144,'',0,21.03996090,105.78395610),(145,'',0,21.04044080,105.78397890),(146,'B3',1,21.03841530,105.78196240),(147,'G7',1,21.03842130,105.78138090);
/*!40000 ALTER TABLE `points` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sinhvien`
--

DROP TABLE IF EXISTS `sinhvien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sinhvien` (
  `MSV` int NOT NULL,
  `Tên` varchar(45) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `Ngày_sinh` datetime DEFAULT NULL,
  `Lớp_khóa_học` varchar(45) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `Giới_tính` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `Nơi_sinh` varchar(45) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`MSV`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sinhvien`
--

LOCK TABLES `sinhvien` WRITE;
/*!40000 ALTER TABLE `sinhvien` DISABLE KEYS */;
INSERT INTO `sinhvien` VALUES (21020021,'Nguyễn Việt Anh Khoa','2003-02-10 00:00:00','QH-2021-I/CQ-J','Nam','Hà Nội'),(21020537,'Lê Thanh Bình','2003-02-06 00:00:00','QH-2021-I/CQ-J','Nam','Hà Nội'),(21020552,'Mai Tú Phương','2003-02-10 00:00:00','QH-2021-I/CQ-J','Nữ','Hà Nội');
/*!40000 ALTER TABLE `sinhvien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `toanha`
--

DROP TABLE IF EXISTS `toanha`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `toanha` (
  `Mã_tòa_nhà` varchar(11) NOT NULL,
  `Thông_tin` varchar(104) DEFAULT NULL,
  PRIMARY KEY (`Mã_tòa_nhà`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `toanha`
--

LOCK TABLES `toanha` WRITE;
/*!40000 ALTER TABLE `toanha` DISABLE KEYS */;
INSERT INTO `toanha` VALUES ('14A','Ký túc xá sinh viên.'),('14B','Ký túc xá sinh viên.'),('14C','Ký túc xá sinh viên.'),('A1','Nhà hiệu bộ ĐH Ngoại Ngữ.'),('A2','Giảng đường ĐH Ngoại Ngữ.'),('A3','Khoa sau đại học - ĐH Ngoại Ngữ.'),('A4','Khoa phương Đông, phương Tây ĐH Ngoại Ngữ.'),('A5','Nhà khách ĐH Ngoại Ngữ.'),('A6','Trường THPT Chuyên Ngoại Ngữ.'),('A7','Nhà đa năng.'),('B1','Khoa quản trị kinh doanh.'),('B2','Giảng đường.'),('B3','Giảng đường.'),('B4','Trung tâm hỗ trợ sinh viên.'),('C1','Giảng đường.'),('C1T','TT thông tin thư viện, VKCO. <br>VNU MEDIA, TT giáo dục thể chất. <br>TT hợp tác & chuyển giao tri thức.'),('C2','Giảng đường.'),('C3','Giảng đường.'),('C4','Văn phòng khoa Pháp - ĐH Ngoại Ngữ.'),('C5','TT Công nghệ thông tin ĐH Ngoại Ngữ.'),('C6','Hội trường Vũ Đình Liên.'),('D1','Hội trường Nguyễn Văn Đạo. <br>Hội trường 10-12. <br>TTNC biển đảo. <br>TTNC biến đổi toàn cầu.'),('D2','Nhà điều hành ĐHQGHN.'),('E1','Khoa Luật.'),('E2','Viện vi sinh vật & công nghệ sinh học trường ĐH Công Nghệ & viện công nghệ thông tin.'),('E3','Viện vi sinh vật & công nghệ sinh học trường ĐH Công Nghệ & viện công nghệ thông tin.'),('E4','Trường ĐH Kinh Tế.'),('E5','Giảng đường.'),('G2','Giảng đường.'),('G3','Giảng đường.'),('G4','Nhà xuất bản, nhà in. <br>TT nghiên cứu về phụ nữ. <br>TT hỗ trợ đào tạo & phát triển đô thị đại học.'),('G5','Giảng đường. <br>TT phát triển ĐHQGHN.'),('G6','Giảng đường.'),('G7','Khoa sau đại học, ĐH giáo dục, TT đào tạo & bồi dưỡng giảng viên lý luận chính trị.'),('G8','Khoa Quốc Tế. <br>TT phát triển hệ thống.'),('GĐ2','Giảng đường 2. <br>Nhà ăn sinh viên.'),('Y1','ĐH Y Dược.');
/*!40000 ALTER TABLE `toanha` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-10-30 21:46:45
