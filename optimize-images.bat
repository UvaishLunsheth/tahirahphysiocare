@echo off
setlocal

echo ----------------------------------------
echo Optimizing images using Sharp CLI
echo ----------------------------------------

REM Input and output folders (relative to this .bat file)
set INPUT=optimize
set OUTPUT=images

REM Create output folder if it doesn't exist
if not exist "%OUTPUT%" mkdir "%OUTPUT%"

REM Make sure we are running where the script is located
pushd %~dp0

REM Loop through only JPG/JPEG/PNG files (no webp)
for %%f in (%INPUT%\*.jpg %INPUT%\*.jpeg %INPUT%\*.png) do (
    echo Processing: %%~nxf

    REM Use full path to avoid path confusion
    set "FILE=%%~ff"

    REM 800 JPG
    sharp -i "%%~ff" -o "%OUTPUT%/{name}-800.jpg" resize 800 --quality 80 --format jpeg

    REM 1200 JPG
    sharp -i "%%~ff" -o "%OUTPUT%/{name}-1200.jpg" resize 1200 --quality 80 --format jpeg

    REM 1600 JPG
    sharp -i "%%~ff" -o "%OUTPUT%/{name}-1600.jpg" resize 1600 --quality 80 --format jpeg

    REM 800 WEBP
    sharp -i "%%~ff" -o "%OUTPUT%/{name}-800.webp" resize 800 --quality 76 --format webp

    REM 1200 WEBP
    sharp -i "%%~ff" -o "%OUTPUT%/{name}-1200.webp" resize 1200 --quality 76 --format webp

    REM 1600 WEBP
    sharp -i "%%~ff" -o "%OUTPUT%/{name}-1600.webp" resize 1600 --quality 76 --format webp

    echo Done: %%~nf
    echo.
)

popd

echo ----------------------------------------
echo All images optimized successfully!
echo Output folder: %OUTPUT%
echo ----------------------------------------
pause
endlocal
