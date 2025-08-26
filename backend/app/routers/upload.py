import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List
from PIL import Image

from app.core.config import settings
from app.dependencies.auth import get_current_active_user
from app.schemas.user import User

router = APIRouter()

def validate_image(file: UploadFile) -> bool:
    """验证图片文件"""
    # 检查文件扩展名
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in settings.allowed_extensions:
        return False
    
    # 检查文件大小
    file.file.seek(0, 2)  # 移动到文件末尾
    file_size = file.file.tell()
    file.file.seek(0)  # 重置文件指针
    
    if file_size > settings.max_file_size:
        return False
    
    return True

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """上传图片"""
    # 验证文件
    if not validate_image(file):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的图片文件或文件过大"
        )
    
    # 确保上传目录存在
    os.makedirs(settings.upload_path, exist_ok=True)
    
    # 生成唯一文件名
    file_ext = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(settings.upload_path, unique_filename)
    
    try:
        # 保存文件
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # 验证图片文件是否可以打开
        try:
            with Image.open(file_path) as img:
                img.verify()
        except Exception:
            # 如果不是有效图片，删除文件
            os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="文件不是有效的图片格式"
            )
        
        # 返回文件URL
        file_url = f"/uploads/{unique_filename}"
        return {"url": file_url}
    
    except Exception as e:
        # 如果保存失败，确保清理文件
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="文件上传失败"
        )

@router.post("/images")
async def upload_images(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """批量上传图片"""
    if len(files) > 10:  # 限制最多10张图片
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="一次最多只能上传10张图片"
        )
    
    uploaded_urls = []
    uploaded_files = []  # 用于错误时清理
    
    try:
        for file in files:
            # 验证文件
            if not validate_image(file):
                # 清理已上传的文件
                for uploaded_file in uploaded_files:
                    if os.path.exists(uploaded_file):
                        os.remove(uploaded_file)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"文件 {file.filename} 无效或过大"
                )
            
            # 确保上传目录存在
            os.makedirs(settings.upload_path, exist_ok=True)
            
            # 生成唯一文件名
            file_ext = os.path.splitext(file.filename)[1].lower()
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            file_path = os.path.join(settings.upload_path, unique_filename)
            
            # 保存文件
            contents = await file.read()
            with open(file_path, "wb") as f:
                f.write(contents)
            
            uploaded_files.append(file_path)
            
            # 验证图片文件是否可以打开
            try:
                with Image.open(file_path) as img:
                    img.verify()
            except Exception:
                # 清理已上传的文件
                for uploaded_file in uploaded_files:
                    if os.path.exists(uploaded_file):
                        os.remove(uploaded_file)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"文件 {file.filename} 不是有效的图片格式"
                )
            
            # 添加URL到结果列表
            file_url = f"/uploads/{unique_filename}"
            uploaded_urls.append(file_url)
        
        return {"urls": uploaded_urls}
    
    except HTTPException:
        raise
    except Exception as e:
        # 如果保存失败，确保清理所有文件
        for uploaded_file in uploaded_files:
            if os.path.exists(uploaded_file):
                os.remove(uploaded_file)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="文件批量上传失败"
        )