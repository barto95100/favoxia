from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Table, Column, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base

bookmark_tags = Table(
    "bookmark_tags",
    Base.metadata,
    Column("bookmark_id", Integer, ForeignKey("bookmarks.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

bookmark_collections = Table(
    "bookmark_collections",
    Base.metadata,
    Column("bookmark_id", Integer, ForeignKey("bookmarks.id", ondelete="CASCADE"), primary_key=True),
    Column("collection_id", Integer, ForeignKey("collections.id", ondelete="CASCADE"), primary_key=True),
)


class Bookmark(Base):
    __tablename__ = "bookmarks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(500))
    url: Mapped[str] = mapped_column(String(2000), unique=True, index=True)
    domain: Mapped[str] = mapped_column(String(500), index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    favicon_url: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    browser: Mapped[str] = mapped_column(String(50), index=True)  # chrome, firefox, safari, edge, brave
    folder: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)
    visit_count: Mapped[int] = mapped_column(Integer, default=0)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    added_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_visited: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    synced_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    tags: Mapped[list["Tag"]] = relationship(secondary=bookmark_tags, back_populates="bookmarks", lazy="selectin")
    collections: Mapped[list["Collection"]] = relationship(secondary=bookmark_collections, back_populates="bookmarks", lazy="selectin")


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    color: Mapped[str] = mapped_column(String(7), default="#A855F7")  # hex color

    bookmarks: Mapped[list["Bookmark"]] = relationship(secondary=bookmark_tags, back_populates="tags", lazy="selectin")


class Collection(Base):
    __tablename__ = "collections"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    icon: Mapped[str] = mapped_column(String(10), default="📁")  # emoji icon
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    bookmarks: Mapped[list["Bookmark"]] = relationship(secondary=bookmark_collections, back_populates="collections", lazy="selectin")


class SyncLog(Base):
    __tablename__ = "sync_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    browser: Mapped[str] = mapped_column(String(50))
    action: Mapped[str] = mapped_column(String(200))
    count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(20), default="success")  # success, error, warning
    synced_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class BrowserConfig(Base):
    __tablename__ = "browser_configs"

    id: Mapped[int] = mapped_column(primary_key=True)
    browser: Mapped[str] = mapped_column(String(50), unique=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    sync_frequency: Mapped[int] = mapped_column(Integer, default=15)  # minutes
    last_sync: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    bookmark_count: Mapped[int] = mapped_column(Integer, default=0)


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[str] = mapped_column(String(50))  # sync, info, warning, error
    title: Mapped[str] = mapped_column(String(200))
    message: Mapped[str] = mapped_column(String(500))
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
