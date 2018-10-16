import {APP_INITIALIZER, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {SortDirective, SortGroupDirective} from './directives/sort.directive';
import {FilterDirective, FilterGroupDirective} from "./directives/filter.directive";
import {TimePipe} from './directives/time.pipe';
import {TOSItemResolver} from "./domain/tos/item/tos-item.resolver";
import {TOSEquipmentResolver} from "./domain/tos/item/equipment/tos-equipment.resolver";
import {TOSBookResolver} from "./domain/tos/item/book/tos-book.resolver";
import {TOSCollectionResolver} from "./domain/tos/item/collection/tos-collection.resolver";
import {TOSMonsterResolver} from "./domain/tos/monster/tos-monster.resolver";
import {TOSRecipeResolver} from "./domain/tos/item/recipe/tos-recipe.resolver";
import {TOSCubeResolver} from "./domain/tos/item/cube/tos-cube.resolver";
import {TOSEquipmentSetResolver} from "./domain/tos/item/equipment/tos-equipment-set.resolver";
import {TOSCardResolver} from "./domain/tos/item/card/tos-card.resolver";
import {TOSGemResolver} from "./domain/tos/item/gem/tos-gem.resolver";
import { InputNumberComponent } from './components/input-number/input-number.component';
import {ClickOutsideModule} from "ng-click-outside";
import {FormsModule} from "@angular/forms";
import {TOSAttributeResolver} from "./domain/tos/attribute/tos-attribute.resolver";
import {TOSJobResolver} from "./domain/tos/job/tos-job.resolver";
import {TOSSkillResolver} from "./domain/tos/skill/tos-skill.resolver";
import {EntityDetailAttackDefenseComponent} from "./components/entity-detail/entity-detail-AttackDefense/entity-detail-AttackDefense.component";
import {EntityDetailBookComponent} from "./components/entity-detail/entity-detail-Book/entity-detail-Book.component";
import {EntityDetailCardComponent} from "./components/entity-detail/entity-detail-Card/entity-detail-Card.component";
import {EntityDetailClassIconGradeComponent} from "./components/entity-detail/entity-detail-ClassIconGrade/entity-detail-ClassIconGrade.component";
import {EntityDetailDescriptionComponent} from "./components/entity-detail/entity-detail-Description/entity-detail-Description.component";
import {EntityDetailDurabilityPotentialSocketsComponent} from "./components/entity-detail/entity-detail-DurabilityPotentialSockets/entity-detail-DurabilityPotentialSockets.component";
import {EntityDetailEnhancementComponent} from "./components/entity-detail/entity-detail-Enhancement/entity-detail-Enhancement.component";
import {EntityDetailGemComponent} from "./components/entity-detail/entity-detail-Gem/entity-detail-Gem.component";
import {EntityDetailInformationComponent} from "./components/entity-detail/entity-detail-Information/entity-detail-Information.component";
import {EntityDetailMaterialNameTypeComponent} from "./components/entity-detail/entity-detail-MaterialNameType/entity-detail-MaterialNameType.component";
import {EntityDetailBonusStatsUnidentifiedComponent} from "./components/entity-detail/entity-detail-BonusStatsUnidentified/entity-detail-BonusStatsUnidentified.component";
import {EntityDetailStatsComponent} from "./components/entity-detail/entity-detail-Stats/entity-detail-Stats.component";
import {EntityDetailTableComponent} from "./components/entity-detail/entity-detail-Table/entity-detail-Table.component";
import {EntityTooltipComponent} from "./components/entity-tooltip/entity-tooltip.component";
import {EntityDetailChildComponent} from "./components/entity-detail/entity-detail-child.component";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {RouterModule} from "@angular/router";
import {SanitizeCSSPipe} from "./directives/sanitize-css.pipe";
import {SanitizeHTMLPipe} from "./directives/sanitize-html.pipe";
import {HttpClient} from "@angular/common/http";
import {TOSRepositoryService} from "./domain/tos/tos-repository.service";
import {EntityDetailSkillComponent} from "./components/entity-detail/entity-detail-Skill/entity-detail-Skill.component";
import {EntityDetailSkillFormulaComponent} from "./components/entity-detail/entity-detail-SkillFormula/entity-detail-SkillFormula.component";
import {EntityDetailJobIconComponent} from "./components/entity-detail/entity-detail-JobIcon/skill-builder-job-icon.component";
import {EntityDetailJobAnimationComponent} from "./components/entity-detail/entity-detail-JobAnimation/entity-detail-JobAnimation.component";

@NgModule({
  imports: [
    CommonModule,
    ClickOutsideModule,
    FontAwesomeModule,
    NgbModule,
    FormsModule,
    RouterModule,
  ],
  exports: [
    // Components
    EntityDetailAttackDefenseComponent,
    EntityDetailBookComponent,
    EntityDetailCardComponent,
    EntityDetailChildComponent,
    EntityDetailClassIconGradeComponent,
    EntityDetailDescriptionComponent,
    EntityDetailDurabilityPotentialSocketsComponent,
    EntityDetailEnhancementComponent,
    EntityDetailGemComponent,
    EntityDetailInformationComponent,
    EntityDetailJobAnimationComponent,
    EntityDetailJobIconComponent,
    EntityDetailMaterialNameTypeComponent,
    EntityDetailSkillComponent,
    EntityDetailSkillFormulaComponent,
    EntityDetailBonusStatsUnidentifiedComponent,
    EntityDetailStatsComponent,
    EntityDetailTableComponent,
    EntityTooltipComponent,
    InputNumberComponent,

    // Directives
    FilterDirective,
    FilterGroupDirective,
    SortDirective,
    SortGroupDirective,

    // Pipes
    SanitizeCSSPipe,
    SanitizeHTMLPipe,
    TimePipe,
  ],
  declarations: [
    // Components
    EntityDetailAttackDefenseComponent,
    EntityDetailBookComponent,
    EntityDetailCardComponent,
    EntityDetailChildComponent,
    EntityDetailClassIconGradeComponent,
    EntityDetailDescriptionComponent,
    EntityDetailDurabilityPotentialSocketsComponent,
    EntityDetailEnhancementComponent,
    EntityDetailSkillComponent,
    EntityDetailSkillFormulaComponent,
    EntityDetailGemComponent,
    EntityDetailInformationComponent,
    EntityDetailJobAnimationComponent,
    EntityDetailJobIconComponent,
    EntityDetailMaterialNameTypeComponent,
    EntityDetailBonusStatsUnidentifiedComponent,
    EntityDetailStatsComponent,
    EntityDetailTableComponent,
    EntityTooltipComponent,
    InputNumberComponent,

    // Directives
    FilterDirective,
    FilterGroupDirective,
    SortDirective,
    SortGroupDirective,

    // Pipes
    SanitizeCSSPipe,
    SanitizeHTMLPipe,
    TimePipe,
  ],
  providers: [
    { provide: APP_INITIALIZER, useFactory: TOSRepositoryService.factory, deps: [HttpClient], multi: true },
    TOSAttributeResolver,
    TOSBookResolver,
    TOSCardResolver,
    TOSCollectionResolver,
    TOSCubeResolver,
    TOSEquipmentResolver,
    TOSEquipmentSetResolver,
    TOSGemResolver,
    TOSItemResolver,
    TOSJobResolver,
    TOSMonsterResolver,
    TOSRecipeResolver,
    TOSSkillResolver,
  ]
})
export class SharedModule { }
