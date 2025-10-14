<template>
    <div class="page-404">
        <div class="page-404-content">
            <div class="page-404-content-title">
                <h1>404</h1>
                <p>Page Not Found</p>
            </div>
        </div>
    </div>
</template>
<style scoped>
.page-404 {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f5f7fa;
}
.page-404-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 48px 32px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
}
.page-404-content-title {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 24px;
}
.page-404-content-title h1 {
    font-size: 48px;
    font-weight: 500;
    color: #303133;
}
.page-404-content-title p {
    font-size: 16px;
    font-weight: 400;
    color: #8c939d;
}
.page-404-content-button {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 12px 24px;
    background-color: #409eff;
    border-radius: 4px;
    color: #fff;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
}
.page-404-content-button:hover {
    background-color: #66b1ff;
}
</style>
