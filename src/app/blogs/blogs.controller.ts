import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  create(@Body() createBlogDto: CreateBlogDto) {
    return this.blogsService.create(createBlogDto);
  }

  @Get()
  findAll(
    @Query('slug') slug: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(1), ParseIntPipe) offset: number,
  ) {
    console.log('Slug:', slug);
    console.log('Limit:', limit);
    console.log('Offset: ', offset);
    return this.blogsService.findAll();
  }
  // We can also add as much as params, but optional param should be at the end
  // stack to make a param optional
  // @Get(':id/:title')
  @Get(':id')
  @Get(':id/:title')
  // if we dont define which param to receive it will be an object containing all params - same for query params
  // findOne(@Param() params)
  findOne(@Param('id') id: string, @Param('title') title?: string) {
    console.log('Title:', title);
    console.log('Id: ', id);
    return this.blogsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogsService.update(+id, updateBlogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogsService.remove(+id);
  }
}
