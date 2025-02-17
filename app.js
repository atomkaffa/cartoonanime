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
            canvas.width = originalImage.width;
            canvas.height = originalImage.height;

            // วาดภาพต้นฉบับบนแคนวาส
            ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

            // โหลดภาพเป็น Tensor
            let imageTensor = tf.browser.fromPixels(originalImage)
                .resizeBilinear([512, 512])  // ปรับเป็น 512x512
                .toFloat()
                .div(127.5)  // Normalize ค่าให้อยู่ในช่วง [-1, 1]
                .sub(1)
                .expandDims(0);  // เพิ่ม batch dimension

            // รันโมเดล
            const result = await model.executeAsync(imageTensor);

            // นำผลลัพธ์มาประมวลผลกลับ
            const outputImage = tf.squeeze(result)
                .add(1)
                .div(2)  // นำกลับสู่ช่วง [0, 1]
                .mul(255)
                .clipByValue(0, 255)
                .toInt();

            // วาดผลลัพธ์ลงบนแคนวาส
            await tf.browser.toPixels(outputImage, canvas);

            // ทำความสะอาดหน่วยความจำ
            imageTensor.dispose();
            result.dispose();
        };
    };

    reader.readAsDataURL(file);
});
