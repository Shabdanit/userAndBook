import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Book } from '../entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { User } from 'src/entities/user.entity';
import { EntityRepository } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: EntityRepository<Book>,
    private readonly em: EntityManager,
  ) {}

  async create(createBookDto: CreateBookDto, user: User): Promise<Book> {
    const book = this.em.create(Book, { ...createBookDto, author: user });
    await this.bookRepository.persistAndFlush(book);
    return book;
  }

  async findAll(): Promise<Book[]> {
    return this.bookRepository.findAll();
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne(id);
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  async update(
    id: number,
    updateBookDto: UpdateBookDto,
    user: User,
  ): Promise<Book> {
    const book = await this.bookRepository.findOne(id);
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    if (book.author.id !== user.id) {
      throw new UnauthorizedException('You are not the owner of this book');
    }
    this.em.assign(book, updateBookDto);
    await this.bookRepository.flush();
    return book;
  }

  async remove(id: number, user: User): Promise<void> {
    const book = await this.bookRepository.findOne(id);
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    if (book.author.id !== user.id) {
      throw new UnauthorizedException('You are not the owner of this book');
    }
    await this.bookRepository.removeAndFlush(book);
  }
}