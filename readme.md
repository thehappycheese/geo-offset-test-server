# Geo Offset Tester

I was working on implementing an Offset trait for the rust geo library.

This is an interactive tester server / front-end;
it is a `warp` based server written in Rust which is directly calling my fork of `geo` via a HTML / Javascript UI.

![Screenshot](readme_extras/screenshot.png)

Hopefully it will help me to fix problems like this:

![Problematic Case](../../../E:/GitProjects/geo-tester/readme_extras/problem_1.png)