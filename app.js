let model;

window.onload = async () => {
    model = await tf.loadGraphModel('model.json');
    console.log('Model Loaded Successfully');
};

document.getElementById('convertButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('imageUpload');
    const originalImage = document.getElementById('originalImage');
    const canvas = document.getElementById('resultCanvas');
    const ctx = canvas.getContext('2d');

    if (fileInput.files.length === 0) {
        alert('กรุณาเลือกภาพก่อน');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
        originalImage.src = e.target.result;

        originalImage.onload = async () => {
            // ดึงขนาดต้นฉบับของภาพ
            const originalWidth = originalImage.naturalWidth;
            const originalHeight = originalImage.naturalHeight;
            canvas.width = originalWidth;
            canvas.height = originalHeight;

            // วาดภาพต้นฉบับลงในแคนวาส
            ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

            // แปลงภาพเป็น Tensor และปรับขนาดเป็น 128x128 ก่อนใส่โมเดล
            let imageTensor = tf.browser.fromPixels(originalImage)
                .resizeBilinear([700, 700])
                .toFloat()
                .div(127.5)
                .sub(1)
                .expandDims(0); // เพิ่ม batch dimension

            // รันโมเดล
            const result = await model.executeAsync(imageTensor);

            // แปลงค่ากลับให้อยู่ในช่วง [0, 255]
            let outputImage = tf.squeeze(result)
                .add(1)
                .div(2)
                .mul(255)
                .clipByValue(0, 255)
                .toInt();

            // ขยายภาพที่โมเดลแปลงแล้วให้กลับไปเป็นขนาดต้นฉบับ
            outputImage = tf.image.resizeBilinear(outputImage.expandDims(0), [originalHeight, originalWidth]);
            outputImage = tf.squeeze(outputImage).toInt(); // นำ batch dimension ออก

            // แสดงภาพที่แปลงแล้วบนแคนวาส
            await tf.browser.toPixels(outputImage, canvas);

            // ทำความสะอาด Tensor
            imageTensor.dispose();
            result.dispose();
            outputImage.dispose();
        };
    };

    reader.readAsDataURL(file);
});
