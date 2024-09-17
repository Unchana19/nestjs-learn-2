import {
  BadRequestException,
  Body,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { UsersService } from 'src/users/providers/users.service';
import { CreatePostDto } from '../dtos/create-post.dto';
import { Repository } from 'typeorm';
import { Post } from '../post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MetaOption } from 'src/meta-options/meta-option.entity';
import { TagsService } from 'src/tags/providers/tags.service';
import { PatchPostDto } from '../dtos/patch-post.dto';

@Injectable()
export class PostsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tagsService: TagsService,

    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,

    @InjectRepository(MetaOption)
    private readonly metaOptionsRepository: Repository<MetaOption>,
  ) {}

  /**
   * Creating new post
   */
  public async create(@Body() createPostDto: CreatePostDto) {
    const author = await this.usersService.findOneById(createPostDto.authorId);

    const tags = await this.tagsService.findMultipleTags(createPostDto.tags);

    const post = this.postsRepository.create({
      ...createPostDto,
      author: author,
      tags: tags,
    });

    return await this.postsRepository.save(post);
  }

  public async findAll(userId: number) {
    const posts = await this.postsRepository.find({
      relations: {
        metaOptions: true,
        // author: true,
        // tags: true,
      },
    });
    return posts;
  }

  public async delete(id: number) {
    await this.postsRepository.delete(id);
    return { deleted: true, id };
  }

  public async update(patchPostDto: PatchPostDto) {
    let tags = undefined;
    let post = undefined;

    try {
      tags = await this.tagsService.findMultipleTags(patchPostDto.tags);
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
      );
    }

    if (!tags || tags.length !== patchPostDto.tags.length) {
      throw new BadRequestException(
        'Please check your tag Ids and ensure they are correct',
      );
    }

    try {
      post = await this.postsRepository.findOneBy({ id: patchPostDto.id });
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
      );
    }

    if (!post) {
      throw new BadRequestException('The post ID dose not exist');
    }

    post.title = patchPostDto.title ?? post.title;
    post.content = patchPostDto.content ?? post.content;
    post.status = patchPostDto.status ?? post.status;
    post.postType = patchPostDto.postType ?? post.postType;
    post.slug = patchPostDto.slug ?? post.slug;
    post.featuredImageUrl =
      patchPostDto.featuredImageUrl ?? post.featuredImageUrl;
    post.publishOn = patchPostDto.publishOn ?? post.publishOn;

    post.tags = tags;

    try {
      await this.postsRepository.save(post);
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
      );
    }
    return post;
  }
}
