-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Oct 09, 2022 at 08:20 AM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 8.1.6

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `vnu_route_planner_db_test`
--
CREATE DATABASE IF NOT EXISTS `vnu_route_planner_db_test` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;
USE `vnu_route_planner_db_test`;

-- --------------------------------------------------------

--
-- Table structure for table `dangky`
--

CREATE TABLE IF NOT EXISTS `dangky` (
  `MSV` int(11) NOT NULL,
  `Mã_HP` varchar(7) NOT NULL,
  `Mã_LHP` varchar(10) NOT NULL,
  `Nhóm` varchar(2) DEFAULT NULL,
  `ID_ghi_chú` int(11) DEFAULT NULL,
  PRIMARY KEY (`MSV`,`Mã_HP`,`Mã_LHP`),
  KEY `fk_ghi_chu_idx` (`ID_ghi_chú`),
  KEY `dangky_fk_msv` (`MSV`),
  KEY `dangky_fk_hp` (`Mã_HP`),
  KEY `dangky_lopmonhoc_fk` (`Mã_HP`,`Mã_LHP`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `dangky`
--

INSERT INTO `dangky` (`MSV`, `Mã_HP`, `Mã_LHP`, `Nhóm`, `ID_ghi_chú`) VALUES
(21020021, 'HIS1001', '20', 'CL', 1),
(21020021, 'INT2204', '22', '4', 1),
(21020021, 'INT2210', '24', '2', 1),
(21020021, 'INT2211', '24', '2', 1),
(21020021, 'INT2212', '24', 'CL', 1),
(21020021, 'JAP4023', '1', 'CL', 1),
(21020537, 'ELT2035', '21', 'CL', 1),
(21020537, 'INT2204', '22', '1', 1),
(21020537, 'INT2210', '24', '2', 1),
(21020537, 'INT2211', '24', '1', 1),
(21020537, 'INT2212', '24', 'CL', 1),
(21020537, 'PES1003', '2', 'CL', 2),
(21020552, 'INT2204', '22', '4', 1),
(21020552, 'INT2210', '24', '2', 1),
(21020552, 'INT2211', '24', '2', 1),
(21020552, 'INT2212', '24', 'CL', 1),
(21020552, 'JAP4023', '1', 'CL', 1),
(21020552, 'MAT1101', '10', 'CL', 1),
(21020552, 'PES1003', '1', 'CL', 2);

-- --------------------------------------------------------

--
-- Table structure for table `ghichu`
--

CREATE TABLE IF NOT EXISTS `ghichu` (
  `ID_ghi_chú` int(11) NOT NULL AUTO_INCREMENT,
  `Nội_dung` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID_ghi_chú`),
  UNIQUE KEY `Nội_dung_UNIQUE` (`Nội_dung`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `ghichu`
--

INSERT INTO `ghichu` (`ID_ghi_chú`, `Nội_dung`) VALUES
(1, 'ĐK lần đầu'),
(4, 'Học cải thiện'),
(3, 'Học lại'),
(2, 'Học tự do');

-- --------------------------------------------------------

--
-- Table structure for table `giangduong`
--

CREATE TABLE IF NOT EXISTS `giangduong` (
  `Mã_tòa_nhà` varchar(11) NOT NULL,
  `Thông_tin` varchar(104) DEFAULT NULL,
  PRIMARY KEY (`Mã_tòa_nhà`),
  KEY `Mã_tòa_nhà` (`Mã_tòa_nhà`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `giangduong`
--

INSERT INTO `giangduong` (`Mã_tòa_nhà`, `Thông_tin`) VALUES
('E5', 'Giảng đường.'),
('G2', 'Giảng đường.'),
('G3', 'Giảng đường.'),
('GĐ2', 'Giảng đường 2. <br>Nhà ăn sinh viên.'),
('Học online', ''),
('Sân VĐ ĐHNN', '');

-- --------------------------------------------------------

--
-- Table structure for table `giangvien`
--

CREATE TABLE IF NOT EXISTS `giangvien` (
  `ID_Giangvien` int(2) NOT NULL,
  `Ten` varchar(24) DEFAULT NULL,
  PRIMARY KEY (`ID_Giangvien`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `giangvien`
--

INSERT INTO `giangvien` (`ID_Giangvien`, `Ten`) VALUES
(0, ''),
(1, 'TS. Tạ Việt Cường'),
(2, 'CN. Đỗ Minh Khá'),
(3, 'TS. Lê Hồng Hải'),
(4, 'CN. Lê Thị Phương'),
(5, 'TS. Phạm Minh Triển'),
(6, 'ThS. Nguyễn Thu Trang'),
(7, 'CN. Nguyễn Tùng Lâm'),
(8, 'ThS. Mai Thanh Minh'),
(9, 'TS. Lưu Mạnh Hà'),
(10, 'CN. Lê Quốc Anh'),
(11, 'Công ty Framgia'),
(12, 'TS. Nguyễn Văn Thắng'),
(13, 'TS. Nguyễn Thị Thu Hường'),
(14, 'TT GDTC');

-- --------------------------------------------------------

--
-- Table structure for table `lopmonhoc`
--

CREATE TABLE IF NOT EXISTS `lopmonhoc` (
  `Mã_HP` varchar(7) NOT NULL,
  `Mã_LHP` varchar(10) NOT NULL,
  `Nhóm` varchar(2) NOT NULL,
  `Tuần` varchar(4) NOT NULL,
  `Thứ` int(1) NOT NULL,
  `Tiết` varchar(5) NOT NULL,
  `Số_phòng` varchar(5) DEFAULT NULL,
  `Giảng_đường` varchar(11) DEFAULT NULL,
  `Số_SV` varchar(3) DEFAULT NULL,
  `Giảng_viên_1` int(2) DEFAULT NULL,
  `Giảng_viên_2` int(2) DEFAULT NULL,
  PRIMARY KEY (`Mã_HP`,`Mã_LHP`,`Nhóm`,`Tuần`,`Thứ`,`Tiết`),
  KEY `Giảng_đường` (`Giảng_đường`),
  KEY `Giảng_viên_1` (`Giảng_viên_1`,`Giảng_viên_2`),
  KEY `Giảng_viên_2` (`Giảng_viên_2`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `lopmonhoc`
--

INSERT INTO `lopmonhoc` (`Mã_HP`, `Mã_LHP`, `Nhóm`, `Tuần`, `Thứ`, `Tiết`, `Số_phòng`, `Giảng_đường`, `Số_SV`, `Giảng_viên_1`, `Giảng_viên_2`) VALUES
('ELT2035', '21', 'CL', '', 6, '10-12', '301', 'GĐ2', '50', 9, 10),
('HIS1001', '20', 'CL', '', 7, '9-10', '3', 'G3', '110', 13, 0),
('INT2204', '22', '1', '2-7', 2, '1-2', 'PM208', 'G2', '30', 6, 7),
('INT2204', '22', '1', '2-7', 6, '1-2', 'PM305', 'G2', '30', 6, 7),
('INT2204', '22', '1', '8-10', 2, '1-2', '', 'Học online', '30', 6, 7),
('INT2204', '22', '4', '2-7', 3, '11-12', 'PM305', 'G2', '30', 8, 0),
('INT2204', '22', '4', '2-7', 3, '9-10', 'PM305', 'G2', '30', 8, 0),
('INT2204', '22', '4', '8-10', 3, '11-12', '', 'Học online', '30', 8, 0),
('INT2204', '22', 'CL', '1-6', 3, '1-2', '301', 'G2', '120', 6, 0),
('INT2204', '22', 'CL', '1-6', 4, '1-2', '301', 'G2', '120', 6, 0),
('INT2204', '22', 'CL', '7-9', 4, '1-2', '', 'Học online', '120', 6, 0),
('INT2210', '24', '2', '2-7', 7, '1-2', 'PM402', 'E5', '40', 1, 2),
('INT2210', '24', '2', '2-7', 7, '3-4', 'PM402', 'E5', '40', 1, 2),
('INT2210', '24', '2', '8-10', 7, '1-2', '', 'Học online', '40', 1, 2),
('INT2210', '24', 'CL', '1-6', 2, '10-11', '308', 'GĐ2', '70', 1, 0),
('INT2210', '24', 'CL', '1-6', 2, '8-9', '308', 'GĐ2', '70', 1, 0),
('INT2210', '24', 'CL', '7-9', 2, '10-11', '', 'Học online', '70', 1, 0),
('INT2211', '24', '1', '2-8', 5, '7-8', '', 'Học online', '33', 3, 4),
('INT2211', '24', '2', '9-15', 5, '7-8', 'PM207', 'G2', '33', 3, 4),
('INT2211', '24', 'CL', '', 5, '1-2', '103', 'G2', '66', 3, 0),
('INT2212', '24', 'CL', '', 4, '9-12', '107', 'G2', '80', 5, 0),
('JAP4023', '1', 'CL', '', 2, '3-4', '312', 'GĐ2', '20', 11, 0),
('JAP4023', '1', 'CL', '', 3, '3-4', '312', 'GĐ2', '20', 11, 0),
('JAP4023', '1', 'CL', '', 4, '3-4', '312', 'GĐ2', '20', 11, 0),
('JAP4023', '1', 'CL', '', 5, '3-4', '312', 'GĐ2', '20', 11, 0),
('JAP4023', '1', 'CL', '', 6, '3-4', '312', 'GĐ2', '20', 11, 0),
('MAT1101', '10', 'CL', '', 5, '7-9', '3', 'G3', '110', 12, 0),
('PES1003', '1', 'CL', '', 2, '1-2', '', 'Sân VĐ ĐHNN', '', 14, 0),
('PES1003', '2', 'CL', '', 2, '3-4', '', 'Sân VĐ ĐHNN', '', 14, 0);

-- --------------------------------------------------------

--
-- Table structure for table `monhoc`
--

CREATE TABLE IF NOT EXISTS `monhoc` (
  `Mã_HP` varchar(7) NOT NULL,
  `Tên_môn_học` varchar(30) DEFAULT NULL,
  `Số_TC` int(11) DEFAULT NULL,
  PRIMARY KEY (`Mã_HP`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `monhoc`
--

INSERT INTO `monhoc` (`Mã_HP`, `Tên_môn_học`, `Số_TC`) VALUES
('ELT2035', 'Tín hiệu và hệ thống', 3),
('HIS1001', 'Lịch sử Đảng Cộng sản Việt Nam', 2),
('INT2204', 'Lập trình hướng đối tượng', 3),
('INT2210', 'Cấu trúc dữ liệu và giải thuật', 4),
('INT2211', 'Cơ sở dữ liệu', 4),
('INT2212', 'Kiến trúc máy tính', 4),
('JAP4023', 'Tiếng Nhật 2A', 4),
('MAT1101', 'Xác suất thống kê', 3),
('PES1003', 'Điền kinh', 1);

-- --------------------------------------------------------

--
-- Table structure for table `sinhvien`
--

CREATE TABLE IF NOT EXISTS `sinhvien` (
  `MSV` int(11) NOT NULL,
  `Tên` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `Ngày_sinh` datetime DEFAULT NULL,
  `Lớp_khóa_học` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Giới_tính` varchar(3) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Nơi_sinh` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`MSV`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `sinhvien`
--

INSERT INTO `sinhvien` (`MSV`, `Tên`, `Ngày_sinh`, `Lớp_khóa_học`, `Giới_tính`, `Nơi_sinh`) VALUES
(21020021, 'Nguyễn Việt Anh Khoa', '2003-02-10 00:00:00', 'QH-2021-I/CQ-J', 'Nam', 'Hà Nội'),
(21020537, 'Lê Thanh Bình', '2003-02-06 00:00:00', 'QH-2021-I/CQ-J', 'Nam', 'Hà Nội'),
(21020552, 'Mai Tú Phương', '2003-02-10 00:00:00', 'QH-2021-I/CQ-J', 'Nữ', 'Hà Nội');

-- --------------------------------------------------------

--
-- Table structure for table `toanha`
--

CREATE TABLE IF NOT EXISTS `toanha` (
  `Mã_tòa_nhà` varchar(11) NOT NULL,
  `Thông_tin` varchar(104) DEFAULT NULL,
  PRIMARY KEY (`Mã_tòa_nhà`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `toanha`
--

INSERT INTO `toanha` (`Mã_tòa_nhà`, `Thông_tin`) VALUES
('14A', 'Ký túc xá sinh viên.'),
('14B', 'Ký túc xá sinh viên.'),
('14C', 'Ký túc xá sinh viên.'),
('14D(GĐ2)', 'Giảng đường 2. <br>Nhà ăn sinh viên.'),
('A1', 'Nhà hiệu bộ ĐH Ngoại Ngữ.'),
('A2', 'Giảng đường ĐH Ngoại Ngữ.'),
('A3', 'Khoa sau đại học - ĐH Ngoại Ngữ.'),
('A4', 'Khoa phương Đông, phương Tây ĐH Ngoại Ngữ.'),
('A5', 'Nhà khách ĐH Ngoại Ngữ.'),
('A6', 'Trường THPT Chuyên Ngoại Ngữ.'),
('A7', 'Nhà đa năng.'),
('B1', 'Khoa quản trị kinh doanh.'),
('B2', 'Giảng đường.'),
('B3', 'Giảng đường.'),
('B4', 'Trung tâm hỗ trợ sinh viên.'),
('C1', 'Giảng đường.'),
('C1T', 'TT thông tin thư viện, VKCO. <br>VNU MEDIA, TT giáo dục thể chất. <br>TT hợp tác & chuyển giao tri thức.'),
('C2', 'Giảng đường.'),
('C3', 'Giảng đường.'),
('C4', 'Văn phòng khoa Pháp - ĐH Ngoại Ngữ.'),
('C5', 'TT Công nghệ thông tin ĐH Ngoại Ngữ.'),
('C6', 'Hội trường Vũ Đình Liên.'),
('D1', 'Hội trường Nguyễn Văn Đạo. <br>Hội trường 10-12. <br>TTNC biển đảo. <br>TTNC biến đổi toàn cầu.'),
('D2', 'Nhà điều hành ĐHQGHN.'),
('E1', 'Khoa Luật.'),
('E2', 'Viện vi sinh vật & công nghệ sinh học trường ĐH Công Nghệ & viện công nghệ thông tin.'),
('E3', 'Viện vi sinh vật & công nghệ sinh học trường ĐH Công Nghệ & viện công nghệ thông tin.'),
('E4', 'Trường ĐH Kinh Tế.'),
('E5', 'Giảng đường.'),
('G2', 'Giảng đường.'),
('G3', 'Giảng đường.'),
('G4', 'Nhà xuất bản, nhà in. <br>TT nghiên cứu về phụ nữ. <br>TT hỗ trợ đào tạo & phát triển đô thị đại học.'),
('G5', 'Giảng đường. <br>TT phát triển ĐHQGHN.'),
('G6', 'Giảng đường.'),
('G7', 'Khoa sau đại học, ĐH giáo dục, TT đào tạo & bồi dưỡng giảng viên lý luận chính trị.'),
('G8', 'Khoa Quốc Tế. <br>TT phát triển hệ thống.'),
('Y1', 'ĐH Y Dược.');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `dangky`
--
ALTER TABLE `dangky`
  ADD CONSTRAINT `dangky_fk_hp` FOREIGN KEY (`Mã_HP`) REFERENCES `monhoc` (`Mã_HP`),
  ADD CONSTRAINT `dangky_fk_id` FOREIGN KEY (`ID_ghi_chú`) REFERENCES `ghichu` (`ID_ghi_chú`),
  ADD CONSTRAINT `dangky_fk_msv` FOREIGN KEY (`MSV`) REFERENCES `sinhvien` (`MSV`),
  ADD CONSTRAINT `dangky_lopmonhoc_fk` FOREIGN KEY (`Mã_HP`,`Mã_LHP`) REFERENCES `lopmonhoc` (`Mã_HP`, `Mã_LHP`);

--
-- Constraints for table `lopmonhoc`
--
ALTER TABLE `lopmonhoc`
  ADD CONSTRAINT `lopmonhoc_ibfk_1` FOREIGN KEY (`Giảng_đường`) REFERENCES `giangduong` (`Mã_tòa_nhà`),
  ADD CONSTRAINT `lopmonhoc_ibfk_2` FOREIGN KEY (`Giảng_viên_1`) REFERENCES `giangvien` (`ID_Giangvien`),
  ADD CONSTRAINT `lopmonhoc_ibfk_3` FOREIGN KEY (`Giảng_viên_2`) REFERENCES `giangvien` (`ID_Giangvien`);
SET FOREIGN_KEY_CHECKS=1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
