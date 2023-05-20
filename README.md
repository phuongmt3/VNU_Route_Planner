<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a name="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/phuongmt3/VNU_Route_Planner">
    <img src="https://preview.redd.it/2yv5x9hto5f61.png?width=341&format=png&auto=webp&s=eccf34f646917d5a7c0196de5c2fc2e7ef3e2427" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">VNU_Route_Planner</h3>

  <p align="center">
    Schedual & find ways to lecture halls in VNU
    <br />
    <a href="https://github.com/phuongmt3/VNU_Route_Planner"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://youtu.be/eqzGzZdYsHk">View Demo</a>
    ·
    <a href="https://github.com/phuongmt3/VNU_Route_Planner/issues">Report Bug</a>
    ·
    <a href="https://github.com/phuongmt3/VNU_Route_Planner/issues">Request Feature</a>
  </p>
</div>


<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#database">Database</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

![Screenshot 2022-12-11 185841](https://user-images.githubusercontent.com/24197774/206910502-a5ca6f33-77b0-4ab4-9e72-a9b8a4d361ff.png)

VNU Route Planner, như tên gọi, là một công cụ giúp sinh viên trường Đại học Quốc Gia Hà Nội có thể dễ dàng tìm đường đi trong khuân viên trường, xem thời khóa biểu và lên kế hoạch cho ngày học tập và làm việc của mình.

Ngoài ra, VNU Route Planner còn tích hợp các chức năng khác giúp người tổ chức sự kiện (sinh viên, giảng viên, ...) lên kế hoạch cho sự kiện của mình một cách hiệu quả nhất.

<!-- Here's a blank template to get started: To avoid retyping too much info. Do a search and replace with your text editor for the following: `github_username`, `repo_name`, `twitter_handle`, `linkedin_username`, `email_client`, `email`, `project_title`, `project_description` -->

<p align="right">(<a href="#readme-top">back to top</a>)</p>


### Built With

* Frontend: 

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)![Bootstrap](https://img.shields.io/badge/bootstrap-%23563D7C.svg?style=for-the-badge&logo=bootstrap&logoColor=white)![jQuery](https://img.shields.io/badge/jquery-%230769AD.svg?style=for-the-badge&logo=jquery&logoColor=white)
* Backend: 

![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white)![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- USAGE EXAMPLES -->
## Usage

<details>
  <summary>Nhập mã sinh viên/ tên sinh viên vào ô tìm kiếm rồi ấn enter để load dữ liệu sinh viên.</summary>
  <img src="https://user-images.githubusercontent.com/24197774/206910775-eedfba6a-d144-4fb1-9d7a-35b716f1639e.png" width="800">
</details>

<details>
  <summary>Đường đi dự tính sẽ hiểu thị khi gần đến (đang trong) thời gian diễn ra sự kiện, hoặc bằng cách ấn vào sự kiện trên thời khóa biểu.</summary>
  <img src="https://user-images.githubusercontent.com/24197774/206910811-ae4cb1ed-81c8-4c97-8292-e07e36f1acdf.png" width="800">
</details>

<details>
  <summary>Để thêm sự kiện, click vào khoảng trống trên calendar. Để xóa, chuột phải rồi click icon X trên sự kiện.</summary>
  <img src="https://user-images.githubusercontent.com/24197774/206910965-86f70688-94d1-4396-b3f1-18cd5b48f55a.png" width="800">
  <img src="https://user-images.githubusercontent.com/24197774/206910997-01e9a558-3297-409a-b87d-a03d011b5219.png" width="800">
  
  Lưu ý: Sự kiện này sẽ được lưu vào bộ nhớ trình duyệt để có thể xem lại sau. 
</details>

<details>
  <summary>Để thêm địa điểm muốn ghé qua trên đường đi, chọn địa điểm trên map rồi click vào Visit, ngược lại, click Unvisit. </summary>
  <img src="https://user-images.githubusercontent.com/24197774/206911142-dd3ae106-9526-4ba5-9447-da869959debb.png" width="800">
  <img src="https://user-images.githubusercontent.com/24197774/206911330-21729719-208c-4996-9559-c705ac9622d8.png" width="800">
  
  Lưu ý: Địa điểm ghé qua không được lưu lại và sẽ biến mất khi ấn vào sự kiện mới. 
</details>


<details>
  <summary>Các công cụ khác nằm trong mục Other tools.</summary>
  <img src="https://user-images.githubusercontent.com/24197774/206911570-9a2cad1d-c21a-40d4-bb54-b7a9775ebe9c.png" width="800">
</details>

<details>
  <summary>Calendar Overlap giúp thống kê thời gian học của một nhóm sinh viên nhất định (ví dụ 1 lớp khóa học).</summary>
  <img src="https://user-images.githubusercontent.com/24197774/206911693-a5a9d79a-50f3-4930-bdbf-a14439aff092.png" width="800">
</details>

<details>
  <summary>Class Timeline giúp thống kê trạng thái của các phòng học trong trường trong 1 ngày nhất định.</summary>
  <img src="https://user-images.githubusercontent.com/74077349/207244925-6659e7b1-b6d6-4cfc-8002-c7b48df06599.png" width="800">
</details>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Notable Points

- Thuật toán tìm đường cho phép linh hoạt thêm bớt các địa điểm trung gian cần đi qua với thời gian xử lý gần như ngay lập tức.
- Tương tác chỉ đường thông minh giữa Calendar và Map. Ví dụ, khi ở thời gian giữa 2 events trên calendar, map sẽ tự động chỉ đường từ event trước đó đến event tiếp theo.
- Animation hiển thị đường đi cần di chuyển sinh động, dễ hiểu.
- Bộ nhớ local trên máy tính riêng của người dùng để lưu lại những calendar events của riêng từng người.

## Database
<details>
  <summary>Các nguồn thu thập dữ liệu:</summary>
  <div><a href="http://112.137.129.87/qldt/"> - Tra cứu danh sách lớp môn học</a></div>
  <div><a href="https://docs.google.com/spreadsheets/d/19MJjkbqBNYJMGRkgw_0SipSdlCRQPTqaTgT69Ux-qtk/edit#gid=1659688272"> - Thời khóa biểu chính thức học kỳ 1 năm 2022-2023</a></div>
  <div><a href="http://112.137.129.30/viewgrade/cdr/"> - Chuẩn đầu ra các khóa</a></div>
  <div><a href="www.openstreetmap.org"> - Openstreetmap</a></div>
</details>
  
<details>
  <summary>Cấu trúc cơ sở dữ liệu:</summary>
  <img src="https://user-images.githubusercontent.com/24197774/206913180-dd751ce5-4bff-467f-8e7f-5f843d7daa81.png" width="800">
</details>

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- CONTRIBUTING -->
## Contributing
Nếu bạn có ý tưởng gì giúp dự án phát triển, hãy vui lòng fork repo này và tạo pull request. Hoặc bạn cũng có thể mở một issue với tag "enhancement". 
Hãy đừng quên cho dự án một star! Xin cảm ơn!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- CONTACT -->
## Contact

Project Link: [https://github.com/phuongmt3/VNU_Route_Planner](https://github.com/phuongmt3/VNU_Route_Planner)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

